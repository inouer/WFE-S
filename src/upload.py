# coding=utf-8

'''
Created on 2012/03/21

@author: okita
'''

import os
import re
import uuid
import urllib2

from base64 import b64encode, b64decode

import webapp2 as webapp

from google.appengine.ext.webapp import template
from google.appengine.ext import db

from BeautifulSoup import *

class HTMLEntity(db.Model):
    url = db.StringProperty()
    page_id = db.StringProperty()
    file_content = db.TextProperty()
    password = db.StringProperty()
    date = db.DateTimeProperty(auto_now_add=True)

#画像ファイルのエンティティ
class ImageEntity(db.Model):
    file_name = db.StringProperty()
    file_content = db.BlobProperty()
    date = db.DateTimeProperty(auto_now_add=True)

#JSファイルのエンティティ
class JavaScriptEntity(db.Model):
    file_name = db.StringProperty()
    file_content = db.TextProperty()
    date = db.DateTimeProperty(auto_now_add=True)
    
#差分更新のエンティティ
class DiffEntity(db.Model):
    page_id = db.StringProperty()
    target_selector = db.StringProperty()
    html_diff = db.TextProperty()
    style_attr = db.StringProperty()
    edit_type = db.StringProperty()
    parse_error = db.BooleanProperty()
    date = db.DateTimeProperty(auto_now_add=True)

class UploadPage(webapp.RequestHandler):
#    def get(self):
#        template_values = {}
#        path = os.path.join(os.path.dirname(__file__), 'upload.html')
#        self.response.out.write(template.render(path, template_values))

    def get(self):
        #ホスト名
#        wfespath = "http://localhost:8081/"
        wfespath = "http://wfesynchrosharer.appspot.com/"
        
        url = self.request.GET.get("url").encode('utf8')
        host = self.request.GET.get("host").encode('utf8')
        charset = self.request.GET.get("charset").encode('utf8')
        if re.compile( 'shift_jis', re.I ).search(charset) is not None:
            charset="cp932"
        
        useragent = self.request.GET.get("useragent").encode('utf8')
        password = self.request.GET.get('password')

        #ブラウザのふりをしてURLからHTMLを取得する
        opener = urllib2.build_opener()
        opener.addheaders = [('User-agent', useragent)]
        fp = opener.open(url)
        html_data = fp.read()
        fp.close()

        #一意のIDを生成する
        #このIDはページのファイル名として使用する
        page_id = "/"+str(uuid.uuid4())+".html"
        
        # 取得したHTMLをパース
        soup = BeautifulSoup(html_data)
        
        # svgタグの保存
        html_data = re.sub('\n','---kaigyo---',html_data)
        svg_tags = re.search('<svg[^>]*>(.*?)</svg>',html_data)
        
        # scriptタグを全て削除
#        script_tags = soup.findAll('script')
#        [script_tag.extract() for script_tag in script_tags]
        
        # body内の分割
        body_part = Tag(soup, "div")
        body_part['id']="body_part"
        child = soup.body.next
        while child is not None:
            child.extract()
            body_part.insert(len(body_part.findAllNext())+1,child)
            child = soup.body.next
        soup.body.insert(0,body_part)
        
        # baseタグが無ければ追加
        base_tags = soup.findAll('base')
        if len(base_tags) < 1:
            base_tag = BeautifulSoup('<base href="'+host+'/">')
            soup.findAll("head")[0].insert(0,base_tag)
        else:
            base_tags[0]['href'] = host
            base_tags[0].extract()
            soup.findAll("head")[0].insert(0,base_tags[0])
            
        # scriptタグを取り込む
        r = re.compile('(<script[^>]*>.*?</script>)')
        script_tags = r.findall(html_data)
        for script in script_tags:
            #中身の取り出し
            r2 = re.compile('<script[^>]*>(.*?)</script>')
            script_inner = r2.findall(script)[0]
            script_data = ""
            if script_inner == "":
                #srcの取り出し
                r3 = re.compile('<script[^src]*src=[\"|\'](.*?)[\"|\'][^>]*>.*?</script>')
                try:
                    target_script = r3.findall(script)[0]
                    opener = urllib2.build_opener()
                    opener.addheaders = [('User-agent', useragent)]
                    # 相対パスかどうかを判定
                    r = re.compile('http')
                    if r.search(target_script) is not None:
                        fp = opener.open(target_script)
                    else:
                        fp = opener.open(host+"/"+target_script)
                    script_data = fp.read()
                    fp.close()
                except:
                    print "src fetch error"
            #src属性を持たない（直書きされている）scriptタグを取り込み
            else:
                script_data = re.sub("---kaigyo---", "\n", script_inner)
                
            #データストアに保存
            js_id = str(uuid.uuid4())+".js"
            js_entity = JavaScriptEntity(key_name="/"+js_id)
            js_entity.file_name = "/"+js_id
            js_entity.file_content = db.Text(script_data, encoding=charset)
            js_entity.put()
            
            #scriptタグを削除
            try:
                html_data = html_data.replace(script,'')
                script_list = soup.findAll('script')
                for script in script_list:
                    script.extract()
            except:
                print "script tag delete error"
            #scriptタグを追加
            new_script = Tag(soup, "script")
            new_script['type']="text/javascript"
            new_script['src']=wfespath+js_id
            soup.findAll("head")[0].insert(0,new_script)
        
        #スクリプトタグを追加する
        # 必要なscriptタグを追加
        jquery_script = BeautifulSoup('<script type="text/javascript" src="'+wfespath+'static/lib/jquery-2.0.0.min.js"></script>')
        channel_script = BeautifulSoup('<script type="text/javascript" src="'+wfespath+'_ah/channel/jsapi"></script>')
        aira_func_script = BeautifulSoup('<script type="text/javascript" src="'+wfespath+'static/aira_func.js"></script>')
        test_script = BeautifulSoup('<script type="text/javascript" src="'+wfespath+'static/test.js"></script>')
        wfes_init_script = BeautifulSoup('<script type="text/javascript" src="'+wfespath+'static/wfesinit.js"></script>')
        jquery_ui_script = BeautifulSoup('<script type="text/javascript" src="'+wfespath+'static/lib/jquery-ui-1.9.2.custom.min.js"></script>')
        text_area_size = BeautifulSoup('<script type="text/javascript" src="'+wfespath+'static/lib/jquery.autosize-min.js"></script>')
#        svg_draggable = BeautifulSoup('<script type="text/javascript" src="'+wfespath+'static/lib/svg.draggable.min.js"></script>')
#        svg_js = BeautifulSoup('<script type="text/javascript" src="'+wfespath+'static/lib/svg.min.js"></script>')
        
#        soup.findAll("head")[0].insert(0,svg_draggable)
#        soup.findAll("head")[0].insert(0,svg_js)
        soup.findAll("head")[0].insert(0,text_area_size)
        soup.findAll("head")[0].insert(0,jquery_ui_script)
        soup.findAll("head")[0].insert(0,channel_script)
        soup.findAll("head")[0].insert(0,aira_func_script)
        soup.findAll("head")[0].insert(0,test_script)
        soup.findAll("head")[0].insert(0,wfes_init_script)
        soup.findAll("head")[0].insert(0,jquery_script)
                         
        # 変更結果のHTML
        html_result = unicode(soup.findAll("html")[0]).encode(charset)

        # BeautifulSoupではSVGを上手くパースできないので置換
        if svg_tags is not None:
            temp = svg_tags.group();
            html_result = re.sub('<svg[^>]*>(.*?)</svg>',svg_tags.group(),html_result)
        html_result = re.sub('---kaigyo---','\n',html_result)
        
        #データストアに保存する
        html_entity = HTMLEntity(key_name=page_id)
        html_entity.url = url
        html_entity.page_id = page_id
        html_entity.file_content = db.Text(html_result, encoding=charset)
        html_entity.password = password
        html_entity.put()

        #'/'を消して，ファイル名を送信する
        #page_id_list = page_id.split('/')

        #これをヘッダに入れないとajaxでエラーが出る
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers['Access-Control-Allow-Headers'] = '*'
        self.response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        self.response.out.write(page_id)

class SitePage(webapp.RequestHandler):
    def get(self):
        htmls = db.GqlQuery("SELECT * FROM HTMLEntity ORDER BY date DESC LIMIT 1")
        for html in htmls:
            self.response.out.write(html.file_content)

class CheckURL(webapp.RequestHandler):
    def get(self):
        url = self.request.GET.get("url")

        #データストア上を検索する
        query = db.GqlQuery("SELECT * FROM HTMLEntity WHERE url =:1",url)
        result = query.get()

#        #一つのURLに対して複数の編集ページを作る場合
#        for result in query.run():
#            result_list.append(result)

        #存在しなければnotexist，存在すればID(編集ページのファイル名)を返す
        if result is None:
            response = "notexist"
        else:
            response = result.page_id

        #これをヘッダに入れないとajaxでエラーが出る
        self.response.headers['Access-Control-Allow-Origin'] = "*"
        self.response.out.write(response)

class UploadImg(webapp.RequestHandler):
    def post(self):
        file = self.request.POST.get("file").encode('utf8')
#        file = re.sub('(.+),','',file)
#        file=b64decode(file)

#        file_ext = re.search('image/(.+);',file)
#        file_ext_list = file_ext.group().split('/')
#        file_ext_list = file_ext_list[1].split(';')

#        img_id = "/"+str(uuid.uuid4())+"."+file_ext_list[0]

        img_id = "/"+str(uuid.uuid4())+".png"

        #データストアに保存する
        image_entity = ImageEntity(key_name=img_id)
        image_entity.file_name = img_id
        image_entity.file_content = db.Blob(str(file))
        image_entity.put()

        self.response.out.write(img_id)

app = webapp.WSGIApplication(
                                     [('/upload', UploadPage),
                                      ('/sites', SitePage),
                                      ('/checkurl', CheckURL),
                                      ('/uploadimg', UploadImg)],
                                     debug=True)
