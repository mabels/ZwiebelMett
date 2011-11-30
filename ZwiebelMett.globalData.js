GlobalData = ZwiebelMett.Doclet("GlobalData", {

  /* 
   * diese Funktion wird nur einmal und vor documentready(ausser das doclet wird 
   * nachgeladen) aufgerufen.
   */
  preReady: function() {
  },

  /*
   * Diese Funktion wird zum Zeitpunkt von documentready aufgerufen und es ist nicht moeglich
   * die Reinfolge der Doclet bind aufrufe festzulegen!
   */
  bind: function(doc, isPartial) {
  },

  /*
   * Diese Funktion wird ggf. irgendwann aufgerufen. 
   */
  unbind: function(doc, isPartial) {
  },

  /*
   * Test-Hook
   * tf ist das TestFramework
   */
  test: function(tf) {
  },

  ajax: function(url, opts) {
    var pre_filter = opts.filter
    var pre_success = opts.success
    opts.success = function() { 
ZwiebelMett.log("data-post") 
      pre_success && pre_success.apply(null, arguments)
    }
  }

})

GlobalData.ajax("partial", {
  success: function() {
    console.log("GlobalData.Ajax
  }
})

