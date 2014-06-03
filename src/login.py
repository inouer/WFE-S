# -*- coding: utf-8 -*-
'''
Created on 2012/03/28

@author: okita
'''

import os
import upload

import webapp2 as webapp

from google.appengine.ext.webapp import template
#from django.utils import simplejson
import json

class Login(webapp.RequestHandler):
    def get(self):
        login_file_path = self.request.get('filepath')
        login_password = self.request.get('code')
        login_file_entity = upload.HTMLEntity.get_by_key_name(login_file_path)
        try:
            if login_file_entity.password == login_password :
                response_values = {
                                   'status': 200
                                   }
            else:
                response_values = {
                                   'status': 401
                                   }

        except AttributeError:
            print '%s is not exist on datastore.\n' % login_file_path
            response_values = {
                               'status': 403
                               }

        self.response.headers['Access-Control-Allow-Origin'] = "*"
        self.response.headers['Content-Type'] = "text/html"
        response_of_login = json.dumps(response_values, ensure_ascii=False)
        self.response.out.write(response_of_login)

class LoginTest(webapp.RequestHandler):
    def get(self):
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'login.html')
        self.response.out.write(template.render(path, template_values))


app = webapp.WSGIApplication(
                                     [('/login', Login)],
                                     debug=True)
