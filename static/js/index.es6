---
---
$(document).ready(() => {
var lei3Po8h = ["support", ["tuna", "tsinghua", "edu", "cn"].join(".")].join("@");
$('a#eib1gieB')
	.text(lei3Po8h)
	.attr('href', ["ma","lto:"].join("i") + lei3Po8h);

$('.selectpicker').selectpicker()

var global_options = {% include options.json %};
var label_map = global_options.options.label_map;
var help_url = {};
global_options.helps.forEach((h) => help_url[h.mirrorid] = h.url);
var new_mirrors = {};
global_options.options.new_mirrors.forEach((m) => new_mirrors[m] = true);
var unlisted = global_options.options.unlisted_mirrors;
var options = {};
global_options.options.force_help_mirrors.forEach((m) => options[m] = {'url': "/help/" + m + "/"})
var descriptions = {};
global_options.options.mirror_desc.forEach((m) => descriptions[m.name] = m.desc);

new Vue({
	el: "#upgrade-mask",
});

var vmMirList = new Vue({
	el: "#mirror-list",
	data: {
		test: "hello",
		mirrorList: [],
		filter: "",
	},
	created () {
		this.refreshMirrorList();
	},
	updated () {
		$('.mirror-item-label').popover();
	},
	computed: {
		nowBrowsingMirror: function(){
			var mirrorName = location.pathname.split('/')[1];
			if(!mirrorName){
				return false;
			}
			mirrorName = mirrorName.toLowerCase();
			var result = this.mirrorList.filter(function(m){
				return m.name.toLowerCase() === mirrorName;
			})[0];
			if(!result){
				return false;
			}
			return result;
		},
		filteredMirrorList: function() {
			var filter = this.filter.toLowerCase();
			return this.mirrorList.filter(function(m){
				return m.is_master && m.name.toLowerCase().indexOf(filter) !== -1;
			});
		},
	},
	methods: {
		getURL (mir) {
			if (mir.url !== undefined) {
				return mir.url
			}
			return `/${mir.name}/`
		},
		refreshMirrorList () {
			var self = this;
			$.getJSON("/static/tunasync.json", (status_data) => {
				var mirrors = [], mir_data = $.merge(status_data, unlisted);
				var mir_uniq = {}; // for deduplication

				mir_data.sort((a, b) => { return a.name < b.name ? -1: 1 });

				for(var k in mir_data) {
					var d = mir_data[k];
					if (d.status == "disabled") {
						continue;
					}
					if (options[d.name] != undefined ) {
						d = $.extend(d, options[d.name]);
					}
					d.label = label_map[d.status];
					d.help_url = help_url[d.name];
					d.is_new = new_mirrors[d.name];
					d.description = descriptions[d.name];
					d.show_status = (d.status != "success");
					if (d.is_master === undefined) {
						d.is_master = true;
					}
					// Strip the second component of last_update
					if (d.last_update_ts) {
						let date = new Date(d.last_update_ts * 1000);
						if (date.getFullYear() > 2000) {
							d.last_update = `${('000'+date.getFullYear()).substr(-4)}-${('0'+(date.getMonth()+1)).substr(-2)}-${('0'+date.getDate()).substr(-2)}` +
								` ${('0'+date.getHours()).substr(-2)}:${('0'+date.getMinutes()).substr(-2)}`;
						} else {
							d.last_update = "0000-00-00 00:00";
						}
					} else {
						d.last_update = d.last_update.replace(/(\d\d:\d\d):\d\d(\s\+\d\d\d\d)?/, '$1');
					}
					if (d.name in mir_uniq) {
						let other = mir_uniq[d.name];
						if (other.last_update > d.last_update) {
							continue;
						}
					}
					mir_uniq[d.name] = d;
				}
				for (k in mir_uniq) {
					mirrors.push(mir_uniq[k]);
				}
				self.mirrorList = mirrors;
				setTimeout(() => {self.refreshMirrorList()}, 10000);
			});
		}
	}
})


var vmIso = new Vue({
	el: "#isoModal",
	data: {
		distroList: [],
		selected: {},
		curCategory: "os"
	},
	created: function () {
		var self = this;
		$.getJSON("/static/status/isoinfo.json", function (isoinfo) {
			self.distroList = isoinfo;
			self.selected = self.curDistroList[0];
			if (window.location.hash.match(/#iso-download(\?.*)?/)) {
				$('#isoModal').modal();
			}
		});
	},
	computed: {
		curDistroList () {
			return this.distroList
				.filter((x)=> x.category === this.curCategory);
		}
	},
	methods: {
		switchDistro (distro) {
			this.selected = distro;
		},
		switchCategory (category) {
			this.curCategory = category;
			this.selected = this.curDistroList[0];
		}
	}
});

});

// vim: ts=2 sts=2 sw=2 noexpandtab
