function SRManager() {
  var self = this;
  self.init();
}

SRManager.prototype.init = function() {
  var self = this;
  self.draw();
};

SRManager.prototype.draw = function() {

  webix.ui({
    view: "scrollview",
    body: {
      type: "space",
      rows: [
        {
          view:"toolbar",
          height: 55,
          elements: [
            { view:"label", template: "<span class='app_title'>SunRiser Manager</span>" },
            {},
            { view: "icon", width: 40, icon: "cogs" }
          ]
        },
        {
          autoheight:true,
          type: "wide",
          cols: []
        }
      ]
    }
  });

};

var sr_manager;

webix.ready(function(){
  sr_manager = new SRManager();
});