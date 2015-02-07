from flask import Flask, request, make_response, json
import keywords

app = Flask(__name__)


@app.route('/keywords')
def kws():
    text = request.args.get('text', None)
    return json.dumps({
        'keywords': keywords.get_keywords(text)
    })


@app.route('/')
def index():
    return make_response(open('templates/index.html').read())

if __name__ == '__main__':
    app.run()
