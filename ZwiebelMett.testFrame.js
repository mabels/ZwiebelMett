ZwiebelMett.TestFrame = {
      _contexts: [],
      print: function(is, str) {
        //ZwiebelMett.log(is, str); 
        var output = $("#ZwiebelMettTestFrame");
        if (!output.length) {
          output = $("<ul></ul>").attr("id", "ZwiebelMettTestFrame")
          $("body").append(output);
        }
        output.append($("<li></li>").addClass(is).text(str));
      },
      log: function(str) {
        str && this._contexts.push(str);
        this.print("log", this._contexts.join(":"));
        str && this._contexts.pop();
      },
      error: function(str) {
        this._contexts.push("ERROR");
        str && this._contexts.push(str);
        this.print("error", this._contexts.join(":"));
        ZwiebelMett.error(this._contexts.join(":"));
        str && this._contexts.pop();
        this._contexts.pop();
      },
      assertEQ: function(c1, c2, title) {
        if (c1 != c2) {
          if (title) {
            this.error(title+":"+c1+"!="+c2);
          } else {
            this.error(c1+"!="+c2);
          }
        } 
        /*
        else {
          title && this.log('OK:'+title)
        }
        */
      },

      assertEQEQ: function(c1, c2, title) {
        if (c1 !== c2) {
          if (title) {
            this.error(title+":"+c1+"!="+c2);
          } else {
            this.error(c1+"!="+c2);
          }
        } else {
          title && this.log('OK:'+title)
        }
      },

      pushContext: function(title) {
        this._contexts.push(title)
        //this.log("Entering-Context");
      },
      popContext: function(title) {
        //this.log("Leaving-Context");
        this._contexts.pop();
      }
    }

ZwiebelMett.Doclet("Test", {
  _liveCycleTestData: [],
  /* 
   * diese Funktion wird nur einmal und vor documentready(ausser das doclet wird 
   * nachgeladen) aufgerufen.
   */
  preReady: function() {
    this._liveCycleTestData.push("preReady"); 
    return "preReady-test";  
  },

  /*
   * Diese Funktion wird zum Zeitpunkt von documentready aufgerufen und es ist nicht moeglich
   * die Reinfolge der Doclet bind aufrufe festzulegen!
   */
  bind: function(doc, isPartial) {
    !isPartial && this._liveCycleTestData.push("bind-test"); 
    return "bind-test";  
  },

  /*
   * Diese Funktion wird ggf. irgendwann aufgerufen. 
   */
  unbind: function(doc, isPartial) {
    return "unbind-test";  
  },

  /*
   * Test-Hook
   * tf ist das TestFramework
   */
  test: function(tf) {
    var safe = this._liveCycleTestData.slice(0)
    tf.pushContext("preReady-Test");
    tf.assertEQ(this.preReady(), "preReady-test");
    tf.popContext();

    tf.pushContext("bind-Test");
    tf.assertEQ(this.bind(), "bind-test");
    tf.popContext();

    tf.pushContext("unbind-Test");
    tf.assertEQ(this.unbind(), "unbind-test");
    tf.popContext();
    this._liveCycleTestData = safe

  }
})

ZwiebelMett.Doclet("FrameWorkTest", {
  preReady: function() {
    var tf = ZwiebelMett.TestFrame
    tf.pushContext("FrameWorkTest")
    tf.pushContext("preReady")
    tf.assertEQ(ZwiebelMett.Doclet("Test").doclet._liveCycleTestData.length, 1, "Length")
    tf.assertEQ(ZwiebelMett.Doclet("Test").doclet._liveCycleTestData[0], "preReady", "Content")
    tf.popContext()
    tf.popContext()
  },
  bind: function(doc, mode) {
    var tf = ZwiebelMett.TestFrame
    tf.pushContext("FrameWorkTest")
    tf.pushContext("bind")
    tf.assertEQ(ZwiebelMett.Doclet("Test").doclet._liveCycleTestData.length, 2, "Length")
    tf.assertEQ(ZwiebelMett.Doclet("Test").doclet._liveCycleTestData.length, 2, "Length")

      !mode && ZwiebelMett.Doclet("TestLateDoclet", {
          _liveCycleTestData: [],
          preReady: ZwiebelMett.Doclet("Test").doclet.preReady,
          bind: ZwiebelMett.Doclet("Test").doclet.bind
      })
      tf.pushContext("TestLateDoclet");
      tf.assertEQ(ZwiebelMett.Doclet("TestLateDoclet").doclet._liveCycleTestData.length, 2, "Length")
      tf.assertEQ(ZwiebelMett.Doclet("TestLateDoclet").doclet._liveCycleTestData[0], "preReady", "PreReady")
      tf.assertEQ(ZwiebelMett.Doclet("TestLateDoclet").doclet._liveCycleTestData[1], "bind-test", "bind-test")
      tf.popContext()

    tf.popContext()
    tf.popContext()
  }
})

