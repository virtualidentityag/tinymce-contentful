window.contentfulExtension.init(function(api) {
  debugger;
  function tinymceForContentful(api) {
    function tweak(param) {
      var t = param.trim();
      if (t === "false") {
        return false;
      } else if (t === "") {
        return undefined;
      } else {
        return t;
      }
    }

    var p = tweak(api.parameters.instance.plugins);
    var tb = tweak(api.parameters.instance.toolbar);
    var mb = tweak(api.parameters.instance.menubar);  

    debugger;

    api.window.startAutoResizer();

    tinymce.init({
      selector: "#editor",
      plugins: p,
      toolbar: tb,
      menubar: mb,
      min_height: 600,
      max_height: 750,
      autoresize_bottom_margin: 15,
      resize: false,
      image_caption: true,
      init_instance_callback : function(editor) {

        debugger;
        var listening = true;

        function getEditorContent() {
          return editor.getContent() || '';
        }

        function getApiContent() {
          return api.field.getValue() || '';
        }

        function setContent(x) {
          var apiContent = x || '';
          var editorContent = getEditorContent();
          if (apiContent !== editorContent) {
            //console.log('Setting editor content to: [' + apiContent + ']');
            editor.setContent(apiContent);
          }
        }

        setContent(api.field.getValue());

        api.field.onValueChanged(function(x) {
          if (listening) {
            setContent(x);
          }
        });

        function onEditorChange() {
          debugger;
          var editorContent = getEditorContent();
          var apiContent = getApiContent();

          if (editorContent !== apiContent) {
            //console.log('Setting content in api to: [' + editorContent + ']');
            listening = false;
            api.field.setValue(editorContent).then(function() {
              listening = true;
            }).catch(function(err) {
              console.log("Error setting content", err);
              listening = true;
            });
          }
        }

        var throttled = _.throttle(onEditorChange, 500, {leading: true});
        editor.on('change keyup setcontent blur', throttled);
      }
    });
  }

  function loadScript(src, onload) {
    debugger;
    var script = document.createElement('script');
    script.setAttribute('src', src);
    script.onload = onload;
    document.body.appendChild(script);
  }

  var sub = location.host == "contentful.staging.tiny.cloud" ? "cloud-staging" : "cloud";
  var apiKey = api.parameters.installation.apiKey;
  var channel = api.parameters.installation.channel;
  // var tinymceUrl = "https://" + sub + ".tinymce.com/" + channel + "/tinymce.min.js?apiKey=" + apiKey;
  var tinymceUrl = "https://frontend.live/tinymce-contentful/master/src/tinymce.js";
  
  debugger;
  loadScript(tinymceUrl, function() {
    tinymceForContentful(api);
  });
});
