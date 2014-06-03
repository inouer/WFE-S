'''
Created on 2012/03/21

@author: okita
'''

import os

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp import template
from google.appengine.ext import db

class HTMLEntity(db.Model):
    file_name = db.StringProperty()
    file_content = db.TextProperty()
    date = db.DateTimeProperty(auto_now_add=True)

class UploadPage(webapp.RequestHandler):
    def get(self):        
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'upload.html')
        self.response.out.write(template.render(path, template_values))
        
    def post(self):        
        html_entity = HTMLEntity()
        file = self.request.get("file")
        #html_entity.file_name = self.request.get('filename')
        html_entity.put()
    
        
       

application = webapp.WSGIApplication(
                                     [('/upload', UploadPage)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()