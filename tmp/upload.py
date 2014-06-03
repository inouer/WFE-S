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
        file = self.request.POST.get("file")
        filename = self.request.body_file.vars['file'].filename
        content = file.file.read()
        
        html_entity = HTMLEntity()
        html_entity.filename = filename
        html_entity.file_content = db.Text(content, encoding='utf8')
        html_entity.put()
        
        self.response.out.write(filename)
        

class SitePage(webapp.RequestHandler):
    def get(self):
        htmls = db.GqlQuery("SELECT * FROM HTMLEntity ORDER BY date DESC LIMIT 1")
        for html in htmls:
            self.response.out.write(html.file_content)

application = webapp.WSGIApplication(
                                     [('/upload', UploadPage),
                                      ('/sites', SitePage)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()