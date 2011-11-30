ZwiebelMett = {
  _waitReady: true,
  Bind: function(fn, context, args) {
    return function() {
      ZwiebelMett.log(context.$list.data("test"))
      fn.apply(context, args)
    }
  },

  log: (function() {
    if (typeof(console) != "undefined" && console.log) { 
      return function() { console.log.apply(console, arguments) }
    }
    return function() { }
  })(),

  Doclet: function(name, doclet) {
    if (!this._doclets) {
      this._doclets = {}
    }
    if (!doclet) {
      return this._doclets[name]
    }
    if (this._doclets[name]) {
      throw new Error("You could only register a doclet once(" + name + ")")
    }
    
    var my = {
      name: name,
      doclet: doclet,
      bind: function(doc, isPartial) {
        this.doclet.bind(doc, isPartial)
      },
      message: function(message){
        var fullMessageName = "Doclet:" + this.name + ":" + message;
        
        return {
          pub: function(data){
            ZwiebelMett.Message.pub(fullMessageName, data);
          },
          sub: function(func){
            ZwiebelMett.Message.sub(fullMessageName, func);
          }
        }
      }
    }
    this._doclets[name] = my;
    
    doclet.preReady && doclet.preReady(doclet);
    !this._waitReady && my.bind(document, false);
    
    return my;
  },

  Message: (function() {
    var $window = $(window);
    return {
      pub: function(event, data) {
        ZwiebelMett.log("pub: "+event);
        $window.trigger(event, data);
      },

      sub: function(event, func) {
        ZwiebelMett.log("sub: "+event);
        $window.bind(event, func);
      },

      unsub: function(event, func) {
        ZwiebelMett.log("unsub: "+event);
        $window.unbind(event, func);
      }
    }
  })(),

  Ajax: (function() {
    var ret = function(url, opts) {
      $.ajax(url, opts)
    }
    ret.partial = function(url, opts, success) {
      opts.async = true;
      success = opts.success
      opts.success = function(html, textStatus, jqXHR) {
        var $partial = $("<div></div>").addClass("ZwiebelMettAjax").append(html);
        opts.filter && opts.filter($partial, textStatus, jqXHR);
        for ( var i in ZwiebelMett._doclets) {
          var doclet = ZwiebelMett._doclets[i]
          doclet.bind && doclet.bind($partial[0], true);
        }
        success.apply(this, [$partial[0], textStatus, jqXHR])
      }
      return $.ajax(url, opts);
    }
    return ret;
  })(),

  Container: function() {
    return function(name, container) {
      if (!this._containers) {
        this._containers = {}
      }
      if (!container) {
        return this._containers[name];
      }
      if (this._containers[name]) {
        throw new Error("You could only register a container once (" + name + ")")
      }

      var my = {
        name: name,
        container: container,
        bind: function(doc) {
          this.container.message = function(message){
            var fullMessageName = "Container:" + name + ":" + message;
            return {
              pub: function(data){
                ZwiebelMett.Message.pub(fullMessageName, data);
              },
              sub: function(func){
                ZwiebelMett.Message.sub(fullMessageName, func);
              }
            }
          };
          this.container.bind(doc)
        },
        get: function(doc) {
          return $(doc).data("Container")[this.name]
        },
        create: function(doc) {
          var $doc = $(doc)
          var dataContainer = $doc.data("Container")
          if (!dataContainer) {
            dataContainer = {}
            $(doc).data("Container", dataContainer);
          }
          var my = function() {}
          my.prototype = this.container
          my = new my()
          my.container = my
          my.name = name;
          my.message = function(message){
            var fullMessageName = "Container:" + this.name + ":" + message;
            return {
              pub: function(data){
                ZwiebelMett.Message.pub(fullMessageName, data);
              },
              sub: function(func){
                ZwiebelMett.Message.sub(fullMessageName, func);
              }
            }
          };
          my.bind(doc)          
          dataContainer[this.name] = my
          return my
        }
      }
      this._containers[name] = my
      return my
    }
  }(),

  Test: function() {
    var testFrame = ZwiebelMett.TestFrame
    testFrame.pushContext("doclets")
    for ( var i in this._doclets) {
      var doclet = this._doclets[i]
      testFrame.pushContext(i)
      doclet && doclet.doclet.test && doclet.doclet.test(testFrame)
      testFrame.popContext()
    }
    testFrame.popContext()
    testFrame.pushContext("containers")
    for ( var i in this._containers) {
      var container = this._containers[i]
      testFrame.pushContext(i)
      container && container.container && container.container.test
          && container.container.test(testFrame)
      testFrame.popContext()
    }
    testFrame.popContext()
  }
}

$(function() {
  if (!ZwiebelMett._waitReady) {
    return

  }
  ZwiebelMett._waitReady = false
  for ( var i in ZwiebelMett._doclets) {
    var doclet = ZwiebelMett._doclets[i]
    doclet && doclet.bind(document, false);
  }
})
