# coding=utf-8

'''
Created on 2012/03/20

@author: okita
'''

import os
import upload
import re
import uuid
import traceback
import sys
import threading

import webapp2 as webapp

from google.appengine.ext.webapp import template
from google.appengine.ext import db
from google.appengine.api import memcache, channel
#from django.utils import simplejson
import json
#import lxml.html
from types import *

from BeautifulSoup import *
from soupselect import select

WFES_KEY = 'wfes'
 
#BeautifulSoupにセレクタのパーサが無い      
#システム専用のセレクタのパーサ（模索中）
def wfesgetelementbyselector(soup, selector):
    try:
        #セレクタを分割
        selector_list = selector.rsplit('>')
        
        #辿る子要素の順番を取り出す
        children_num_list = []
        for s in selector_list:
            if s.find('TBODY') == -1:
                search_result = re.search('[^\(]*\((\w+)\)[^\)]*', s)
                if search_result is not None:
                    children_num_list.append(search_result.group(1).encode("utf-8"))
        
        #domを辿る
        target_element = soup.body.next        
        for num in children_num_list:
            num_int = int(num)
            #一つ下がる
            target_element = target_element.next
            #NavigableStringを除外
            while str(type(target_element)).find(unicode("NavigableString")) != -1 or str(type(target_element)).find(unicode("Comment")) != -1:
                target_element = target_element.nextSibling
            
            #兄弟を辿る
            while num_int>1:
                target_element = target_element.nextSibling
                while str(type(target_element)).find(unicode("NavigableString")) != -1 or str(type(target_element)).find(unicode("Comment")) != -1:
                    target_element = target_element.nextSibling
                num_int-=1
                
    #    #TBODYがあるとセレクタが働かない
    #    selector = re.sub('>TBODY[^\)]*\)','',selector)
        
        return target_element
    except:
        return "parseerror"

#プッシュ配信を別スレッドで実行
def pushworker(html_file_name_to_update, title_to_update, selector_to_update, html_text_to_update, comment_style_attr, comment_id, edit_type, start):
    #差分情報を送信
    push_contents = {
                     'type': "success",
                     'title': title_to_update,
                     'selector': selector_to_update,
                     'html_text': html_text_to_update,
                     'comment_style_attr': comment_style_attr,
                     'comment_id': comment_id,
                     'edit_type': edit_type,
                     'start': start
                     }
    push_message = json.dumps(push_contents, ensure_ascii=False)

    #全クライアントにブロードキャスト
    try:
        channel.send_message(html_file_name_to_update[1:], push_message)
    except:
        push_contents = {
                         'type': "fault"
                         }
        push_message = json.dumps(push_contents, ensure_ascii=False)
        channel.send_message(html_file_name_to_update[1:], push_message)
        
#トップページ表示機構に変更し，元の機能はHTMLPageへ移した
#トップページにブックマークレットとかを置いておく?
class MainPage(webapp.RequestHandler):
    def get(self):
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))

#要求されたHTMLまたは画像を返す
#元々のMainPageの機能を持つ
class HTMLPage(webapp.RequestHandler):
    def get(self):
        #URLからリクエストされたファイル名を取り出す
        request_file_name = self.request.path

        #HTMLを送信する場合
        if re.match('.*\.html', request_file_name):
            #リクエストされたファイルのインスタンスを取得する
            request_file = upload.HTMLEntity.get_by_key_name(request_file_name)

            #HTMLがデータベース上に存在しない場合の例外処理
            if request_file is None:
                self.response.headers['Content-Type'] = "text/html"
                self.response.out.write("<html>'" + request_file_name + "' is not found.</html>")
            else:
                #ファイルを送信する
                self.response.headers['Content-Type'] = "text/html; charset=utf8"
                self.response.headers['Access-Control-Allow-Origin'] = '*'
                self.response.out.write(request_file.file_content)
        #JSを送信する場合
        elif re.match('.*\.js', request_file_name):
            #リクエストされたファイルのインスタンスを取得する
            request_file = upload.JavaScriptEntity.get_by_key_name(request_file_name)

            #ファイルを送信する
            self.response.headers['Content-Type'] = "application/javascript"
            self.response.headers['Access-Control-Allow-Origin'] = '*'
            if request_file is not None:
                self.response.out.write(request_file.file_content)
        #画像を送信する場合
        else:
            #リクエストされたファイルのインスタンスを取得する
            request_file = upload.ImageEntity.get_by_key_name(request_file_name)

            #拡張子を取り出すために分割する
            file_name_list = request_file_name.split('.')

            #ファイルを送信する
#            self.response.headers['Content-Type'] = "image/"+file_name_list[1]
            self.response.headers['Content-Type'] = "text/plain"
            self.response.headers['Access-Control-Allow-Origin'] = '*'
            if request_file is not None:
                self.response.out.write(request_file.file_content)

#差分を返す
class GetDiff(webapp.RequestHandler):
    def get(self):
        request_file_name = self.request.get('filename')
        request_file_name = "/" + request_file_name

        #リクエストされたファイルの差分情報を取得する
        q = upload.DiffEntity.gql("WHERE page_id = :1", request_file_name)

        #一度に1000個までしか取り出せない
        #1000個以上の更新がある場合については後で考える
        results = q.fetch(1000)

        if len(results) != 0:
            selector_list = []
            html_text_list = []
            style_attr_list = []
            edit_type_list = []
            for a in results:
                if a.parse_error:
                    selector_list.append(a.target_selector)
                    html_text_list.append(a.html_diff)
                    style_attr_list.append(a.style_attr)
                    edit_type_list.append(a.edit_type)

            push_contents = {
                             'type': "success",
                             'selector': selector_list,
                             'html_text': html_text_list,
                             'style_attr': style_attr_list,
                             'edit_type': edit_type_list
                             }
        else:
            push_contents = {
                             'type': "fault"
                             }

        push_message = json.dumps(push_contents, ensure_ascii=False)
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.out.write(push_message)

#POSTされたメッセージの処理機構
#受け取ったメッセージに各処理を行って全クライアントに配信する
class PostHTML(webapp.RequestHandler):
    def post(self):
        html_file_name_to_update = self.request.get('filename')
        #差分更新
        selector_to_update = self.request.get('selector');
        html_text_to_update = self.request.get('html');
        title_to_update = self.request.get('title');
        #コメント用のstyle
        comment_style_attr = self.request.get('style');
        #コメント用のID
        comment_id = self.request.get('id');
        edit_type = self.request.get('edittype');
        #HTMLエンコード，デコード用のcharset
        charset = self.request.get('charset')
        start = self.request.get('start')

        #プッシュ配信を別スレッドで実行   
        t = threading.Thread(target=pushworker, args=(html_file_name_to_update, title_to_update, selector_to_update, html_text_to_update, comment_style_attr, comment_id, edit_type, start,))
        t.setDaemon(True)
        t.start()
    
        #データストア上のHTMLに変更を適用
        #変更結果のHTML
        update_result = ""
        
        # HTMLを取り出す
        request_file = upload.HTMLEntity.get_by_key_name(html_file_name_to_update)
        # パースしてセレクタからターゲット要素を取得
        soup = BeautifulSoup(request_file.file_content)
        if edit_type == "editText" or edit_type=="":        
            # BeautifulSoup用のselectorパーサ
            target_element = wfesgetelementbyselector(soup, selector_to_update)
                
            if target_element == "parseerror":
                global parse_error
                parse_error = True
            else:  
                # 変更内容をパース
                soup_update = BeautifulSoup(html_text_to_update)
                # 変更を適用
                # 子要素削除
                target_element.string = ""
                child = target_element.next
                while child is not None:
                    child.extract()
                    child = child.nextSibling
                # 編集後の要素挿入
                target_element.insert(0,soup_update)
                
                # 変更結果のHTML
                update_result = str(soup.findAll("html")[0])
                # データストアを更新
                #変更しない属性を保持する
                update_file = upload.HTMLEntity.get_by_key_name(html_file_name_to_update)
                url = update_file.url
                password = update_file.password
                #保存する
                html_entity = upload.HTMLEntity(key_name=html_file_name_to_update)
                html_entity.url = url
                html_entity.page_id = html_file_name_to_update
                html_entity.file_content = db.Text(update_result, encoding=charset)
                html_entity.password = password
                html_entity.put()
        elif edit_type == "insertComment":
            # コメントのノード生成            
            comment_tag = Tag(soup, "div")
            comment_tag['id']=comment_id
            comment_tag['style']=comment_style_attr
            comment_tag.insert(0,html_text_to_update)
            
            soup.body.insert(len(soup.body.contents),comment_tag)
            
            # 変更結果のHTML
            update_result = str(soup.findAll("html")[0])
            # データストアを更新
            #変更しない属性を保持する
            update_file = upload.HTMLEntity.get_by_key_name(html_file_name_to_update)
            url = update_file.url
            password = update_file.password
            #保存する
            html_entity = upload.HTMLEntity(key_name=html_file_name_to_update)
            html_entity.url = url
            html_entity.page_id = html_file_name_to_update
            html_entity.file_content = db.Text(update_result, encoding=charset)
            html_entity.password = password
            html_entity.put()
        elif edit_type == "editComment":   
            # BeautifulSoup用のselectorパーサ
            target_element = wfesgetelementbyselector(soup, selector_to_update)     
            
            if target_element == "parseerror":
                global parse_error
                parse_error = True
            else:            
                # 変更を適用
                # 子要素削除
                target_element.string = ""
                child = target_element.next
                while child is not None:
                    child.extract()
                    child = child.nextSibling
                # 編集後の要素挿入
                target_element.insert(0,html_text_to_update)
                
                target_element['style']=""
                target_element['style']=comment_style_attr
                
                # 変更結果のHTML
                update_result = str(soup.findAll("html")[0])
                # データストアを更新
                #変更しない属性を保持する
                update_file = upload.HTMLEntity.get_by_key_name(html_file_name_to_update)
                url = update_file.url
                password = update_file.password
                #保存する
                html_entity = upload.HTMLEntity(key_name=html_file_name_to_update)
                html_entity.url = url
                html_entity.page_id = html_file_name_to_update
                html_entity.file_content = db.Text(update_result, encoding=charset)
                html_entity.password = password
                html_entity.put()
        elif edit_type == "editSVGText" or edit_type == "createSVGElement":
            # BeautifulSoup用のselectorパーサ
            target_element = wfesgetelementbyselector(soup, selector_to_update)
            if target_element == "parseerror":
                parse_error = True
            
            
        # 差分情報管理
        if edit_type == "deleteComment":
            #差分情報を削除する（コメントの削除）
            q = upload.DiffEntity.gql("WHERE page_id = :1 and target_selector = :2", html_file_name_to_update, selector_to_update)
            result = q.fetch(1)

            if result is not None and len(result) != 0:
                 result[0].delete()
        elif edit_type == "editTitle":
            #差分情報を保存する（タイトル）
            #キー値は「(ファイル名) - Title」という形式
            diff_entity = upload.DiffEntity(key_name=html_file_name_to_update + " - Title")
            diff_entity.page_id = html_file_name_to_update
            diff_entity.target_selector = selector_to_update
            diff_entity.html_diff = db.Text(title_to_update)
            diff_entity.style_attr = comment_style_attr
            diff_entity.edit_type = edit_type;
            diff_entity.parse_error = parse_error
            diff_entity.put()            
        else:
            #差分情報を保存する
            #キー値は「(ファイル名) - (セレクタ)」という形式
            diff_entity = upload.DiffEntity(key_name=html_file_name_to_update + " - " + selector_to_update)
            diff_entity.page_id = html_file_name_to_update
            diff_entity.target_selector = selector_to_update
            diff_entity.html_diff = db.Text(html_text_to_update)
            diff_entity.style_attr = comment_style_attr
            diff_entity.edit_type = edit_type;
            diff_entity.parse_error = parse_error
            diff_entity.put()

#スナップショットを取る時の処理機構
class PostFullHTML(webapp.RequestHandler):
    def post(self):
        html_file_name_to_update = self.request.get('filename')
        html_text_to_update = self.request.get('body')

        #データストアに保存する
        #変更しない属性を保持する
        update_file = upload.HTMLEntity.get_by_key_name(html_file_name_to_update)
        url = update_file.url
        password = update_file.password
        #保存する
        html_entity = upload.HTMLEntity(key_name=html_file_name_to_update)
        html_entity.url = url
        html_entity.page_id = html_file_name_to_update
        html_entity.file_content = db.Text(html_text_to_update)
        html_entity.password = password
        html_entity.put()

#トークン生成機構
#トークンを生成して返す
class GetChannelToken(webapp.RequestHandler):
    def get(self):
        filename = self.request.get('filename')

        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.out.write(channel.create_channel(filename).encode('UTF-8'))

#'/'の場合はMainPage
#'/xxx.xxx'(HTMLファイルまたは画像ファイル)の場合はHTMLPage
app = webapp.WSGIApplication(
                                     [(r'/', MainPage),
                                      (r'/.*\..*', HTMLPage),
                                      ('/getdiff', GetDiff),
                                      ('/posthtml', PostHTML),
                                      ('/postfullhtml', PostFullHTML),
                                      ('/getchanneltoken', GetChannelToken)],
                                     debug=True)
