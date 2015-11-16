var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

describe('RecordingsView', function() {

  var model = {
    _listeners: {},
    _archives: {},
    _fire: function(data) {
      this._archives = data;
      this._listeners.value[0].method(data);
    },
    addEventListener: function(type, fc) {
      if (!(type in this._listeners)) {
        this._listeners[type] = [];
      }
      this._listeners[type].push({
        method: fc,
        context: undefined
      });
    },
    init: function() {
      return Promise.resolve();
    },
    get archives() {
      return this._archives;
    }
  };

  var now = Date.now();

  var archives = {
    one: {
      id: '1',
      localDownloadURL: 'http://xxx.com/',
      recordingUser: 'aUser1',
      status: 'stopped',
      duration: 1,
      createdAt: now
    },
    two: {
      id: '2',
      localDownloadURL: 'http://yyy.com/',
      recordingUser: 'aUser2',
      status: 'started',
      duration: 50,
      createdAt: now - 1000
    },
    three: {
      id: '3',
      localDownloadURL: 'http://zzz.com/',
      recordingUser: 'aUser3',
      status: 'available',
      duration: 459,
      createdAt: now - 2000
    }
  };

  var container = null;

  before(function() {
    model._listeners = {};
    window.document.body.innerHTML =
      window.__html__['test/unit/recordingsView_spec.html'];
    container = document.querySelector('.videos.tc-list ul');
  });

  afterEach(function() {
    container.innerHTML = '';
  });

  describe('#init', function() {
    it('should exist', function() {
      expect(RecordingsView.init).to.exist;
      expect(RecordingsView.init).to.be.a('function');
    });

    it('should be initialized properly with only a listener for onvalue event', function() {
      RecordingsView.init(model);
      var keys = Object.keys(model._listeners);
      expect(keys.length).to.equal(1);
      expect(keys[0]).to.equal('value');
      expect(model._listeners.value.length).to.equal(1);
    });

    it('should render archives', function() {
      expect(container.children.length).to.equal(0);

      RecordingsView.init(model);

      model._fire(archives);

      expect(container.children.length).to.equal(3);

      var items = container.querySelectorAll('li > a.file');
      var keysArchives = Object.keys(archives);
      for (var i = 0, l = items.length; i < l; i++) {
        var item = items[i];
        var values = archives[keysArchives[i]];
        expect(item.textContent).to.contain(values.recordingUser);
        expect(item.href).to.equal(values.localDownloadURL);
        expect(item.parentNode.dataset.status).to.equal(values.status);
      }

      var items = container.querySelectorAll('li > i');
      var keysArchives = Object.keys(archives);
      for (var i = 0, l = items.length; i < l; i++) {
        var item = items[i];
        var values = archives[keysArchives[i]];
        expect(item.dataset.id).to.equal(values.id);
        expect(item.dataset.action).to.equal('delete');
      }
    });

    it('should delete archives', sinon.test(function(done) {
      RecordingsView.init(model);
      model._fire(archives);
      var id = archives.one.id;

      this.stub(window, 'dispatchEvent', function(event) {
        expect(event.type).to.equal('archive');
        expect(event.detail.id).to.equal(id);
        expect(event.detail.action).to.equal('delete');
        expect(event.detail.name).to.equal(archives.one.name);
        done();
      });

      var item = container.querySelector('li > i[data-id="' + id + '"]');
      item.click();
    }));
  });
});
