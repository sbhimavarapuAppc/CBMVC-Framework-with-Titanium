/**
 * @file overview This file contains the core framework class CBMVC.
 * @author Winson  winsonet@gmail.com
 * @copyright Winson http://www.coderblog.in
 * @license MIT License http://www.opensource.org/licenses/mit-license.php
 *
 * @disclaimer THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * 	PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Common functions for all controllers and views
 */
CB.Common = {
	UI : {
		/**
		 * Create a dropdown list within a web view
		 * @param {Object} view, which view need to add the dropdown list object
		 *
		 * view.ddlArgs = {
		 * 	id : ddl object id,
		 *  innerWidth: webview ddl width,
		 *  innerHeight: webview ddl height,
		 *  innerFontSize: webview ddl font size(default is 12),
		 *  top: ddl top,
		 *  left: ddl left,
		 *  width: ddl width,
		 *  height: ddl height,
		 *  items :[
		 * 		//'the ddl option items'
		 * 		{text:'test', value:1}
		 * 	],
		 *  callback : the call back function
		 * }
		 */
		createDropDownList : function(view) {
			var html = "<html><meta name='viewport' content='user-scalable=0'><body bgcolor='#5a5c64' style='margin:0;padding:0'>";
			html += "<select id='{0}' style='width: {1}px; height: {2}px; font-size: {3}px; '>";
			for (var itemIndex in view.ddlArgs.items) {
				html += "<option value=\"{0}\">{1}</option>".format(view.ddlArgs.items[itemIndex].value, view.ddlArgs.items[itemIndex].text);
			}
			html += "</select>";
			html += "<script type='text/javascript'>";
			html += "document.getElementById('{0}').onchange = function(){ Titanium.App.fireEvent('app:set{0}',{value:this.value}); };";
			html += "</script>";
			html += "</body></html>";

			html = html.format(view.ddlArgs.id, view.ddlArgs.innerWidth, view.ddlArgs.innerHeight, view.ddlArgs.innerFontSize == undefined ? '12' : view.ddlArgs.innerFontSize);

			view[view.ddlArgs.id + 'WebView'] = Ti.UI.createWebView({
				top : view.ddlArgs.top,
				left : view.ddlArgs.left,
				width : view.ddlArgs.width,
				height : view.ddlArgs.height,
				html : html
			});
			view.add(view[view.ddlArgs.id + 'WebView']);

			Ti.App.addEventListener("app:set" + view.ddlArgs.id, function(e) {
				view.ddlArgs.callback(e);
			});
		},
		/**
		 * Create base with a left menu.
		 * return the view and there are two sub view in it:
		 * view.mainFrame : this is the menu layout view
		 * view.contentView : this is a view of layout element, you must add all element within this view
		 * 
		 * @param {String} viewName
		 */
		createBaseViewWithMenu : function(viewName) {
			var mainView = Ti.UI.createView();
			
			mainView.mainFrame = Ti.UI.createView(CB.Styles.menu.mainFrame);
			mainView.add(mainView.mainFrame);
			
			mainView.contentView = Ti.UI.createView(CB.Styles.common.baseView);
			mainView.name = viewName;
			mainView.mainFrame.add(mainView.contentView);

			//menu layout
			mainView.mainFrame.mainMenu = Titanium.UI.createView(CB.Styles.menu.mainMenu);
			mainView.mainFrame.add(mainView.mainFrame.mainMenu);

			mainView.mainFrame.mainMenu.mainMenuBar = Titanium.UI.createView(CB.Styles.menu.mainMenuBar);
			mainView.mainFrame.mainMenu.add(mainView.mainFrame.mainMenu.mainMenuBar);

			mainView.mainFrame.mainMenu.mainMenuBar.menuSelected = Ti.UI.createView(CB.Styles.menu.menuSelected);

			mainView.mainFrame.mainMenu.menuBtn = Ti.UI.createButton(CB.Styles.menu.menuBtn);
			mainView.mainFrame.mainMenu.add(mainView.mainFrame.mainMenu.menuBtn);

			//menu buttons
			mainView.mainFrame.mainMenu.mainMenuBar.homeBtn = Ti.UI.createButton(CB.Styles.menu.homeBtn);
			mainView.mainFrame.mainMenu.add(mainView.mainFrame.mainMenu.mainMenuBar.homeBtn);

			mainView.mainFrame.mainMenu.mainMenuBar.settingBtn = Ti.UI.createButton(CB.Styles.menu.settingBtn);
			mainView.mainFrame.mainMenu.add(mainView.mainFrame.mainMenu.mainMenuBar.settingBtn);


			//menu events
			mainView.mainFrame.addEventListener('click', function(e) {
				CB.Debug.dump(e.source, 98, 'common.js');
				//just click on the view
				if (e.source != undefined) {
					CB.Common.toggleMenu(mainView.mainFrame);
				}
			});

			mainView.mainFrame.mainMenu.menuBtn.addEventListener('click', function() {
				CB.Common.toggleMenu(mainView.mainFrame);
			});

			mainView.mainFrame.mainMenu.mainMenuBar.addEventListener('click', function() {
				CB.Common.toggleMenu(mainView.mainFrame);
			});

			mainView.mainFrame.mainMenu.mainMenuBar.homeBtn.addEventListener('click', function() {
				//CB.controllers.mainFrame.toggleMenu();
				CB.Launch(null, null, 'left');
			});

			mainView.mainFrame.mainMenu.mainMenuBar.settingBtn.addEventListener('click', function() {
				CB.pushController(CB.controllers.setting);
			});

			//this.setCurrMenu(mainView);
			return mainView;
		}
	},
	/**
	 * User login function
	 * @param {String} userId, login user id
	 * @param {String} userPassword, alert box title
	 * @param {Object} controller, the controller should be redirect after login success
	 */
	login : function(userId, userPassword, controller) {
		//call api for login checking
		var ajaxObj = {
			timeout : CB.API.timeout,
			type : 'GET',
			data : {
				debug : CB.DebugMode.api,
				user_id : userId,
				user_password : userPassword
			},
			url : CB.API.login,
			onerror : function(d) {
				CB.Debug.dump(d, 23, 'base/common.js');
				alert(CB.Util.L('unknowError'));
				CB.Platform.actInd.hide();
			},
			callback : function(d) {
				CB.Debug.dump(d.login.response_details, 28, 'base/common.js');
				CB.Platform.actInd.hide();

				if (d.login.response_details != undefined) {
					var status = d.login.response_details.status;
					switch(status) {
						case '1':
							CB.Util.alert(CB.Util.L('invalidUser'), CB.Util.L('error'));
							break;
						case '2':
							CB.Util.alert(CB.Util.L('wrongPassword'), CB.Util.L('error'));
							break;
						case '0':
							CB.Models.User.sessionId = d.login.response_details.session_id;
							CB.Models.User.user_key = d.login.response_details.user_key;
							CB.Util.saveObject('user', CB.Models.User);
							CB.Common.getRemoteData('info', controller, true);
							break;
						default:
							CB.Util.alert(CB.Util.L('unknowError'), CB.Util.L('error'));
							break;
					}

				} else {
					CB.Util.alert(CB.Util.L('unknowError'), CB.Util.L('error'));
				}
			}
		}
		CB.Platform.actInd.show();
		CB.Ajax.request(ajaxObj);
	},
	/**
	 * Get date with remote API function
	 * @param {String} api, the API's name
	 * @param {Object} controller, which controller need to show after got data
	 * @param {Boolean} saveData, save response data to local storage or just pass data to next view
	 * 					true, save in local storage
	 * 					false, just pass data to controller.model to next view
	 * @param {String} animate
	 * @param {Object} requestData, the data need to be pass to server (except user session_id and user_key)
	 */
	getRemoteData : function(api, controller, saveData, animate, requestData) {
		//get login user
		var user = CB.Util.loadObject('user');

		if (user != null) {

			var ajaxObj = {
				timeout : CB.API.timeout,
				type : 'GET',
				data : {
					debug : CB.DebugMode.api,
					session_id : user.sessionId,
					user_key : user.user_key
				},
				url : CB.API[api],
				onerror : function(d) {
					CB.Debug.dump(d, 156, 'base/common.js');
					CB.Util.alert(CB.Util.L('unknowError'), CB.Util.L('error'));
				},
				callback : function(d) {
					CB.Debug.dump(d, 160, 'base/common.js');
					var result = d[api].response_details;
					if (result.status == '0') {
						if (saveData) {
							CB.Util.removeObject(api);
							CB.Util.saveObject(api, result);
						} else {
							controller.model = result;
						}
						CB.pushController(controller, animate);
					} else {
						CB.Util.removeObject('user');
						if (saveData) {
							CB.Util.removeObject(api);
						}
						CB.Util.alert(CB.Util.L('timeout'), CB.Util.L('error'));
						CB.Launch(null, null, 'right');
					}
				}
			}
			if (requestData != undefined) {
				CB.Platform.extend(ajaxObj.data, requestData);
			}
			CB.Ajax.request(ajaxObj);
		} else {
			CB.Util.removeObject('user');
			if (saveData) {
				CB.Util.removeObject(api);
			}
			CB.Util.alert(CB.Util.L('timeout'), CB.Util.L('error'));
			CB.Launch(null, null, 'right');
		}
	},
	/**
	 * Common view header
	 * @param {Object} view
	 */
	viewHeader : function(view) {
		//common layout functions and elements within header
	},
	/**
	 * Common view foter
	 * @param {Object} view
	 */
	viewFooter : function(view) {
		//common layout functions and elements within footer
	},

	
	setCurrMenu : function(mainView, currMenu) {
		mainView.mainMenu.mainMenuBar.menuSelected.top = currMenu;
		CB.Util.saveObject('currMenu', currMenu);
	},
	showCurrMenu : function(mainView) {
		var currMenu = CB.Util.loadObject('currMenu');
		if (currMenu == undefined) {
			currMenu = CB.Styles.menuSelectedTop.home;
		}
		mainView.mainMenu.mainMenuBar.menuSelected.top = currMenu;
	},
	isMenuOpen : function(mainView) {
		return (mainView.left == -CB.screenWidth);
	},
	toggleMenu : function(mainView, block) {
		if (this.isMenuOpen(mainView)) {
			this.openMenu(mainView, block);
		} else {
			this.closeMenu(mainView, block);
		}
	},
	closeMenu : function(mainView, block) {
		mainView.mainMenu.remove(mainView.mainMenu.mainMenuBar.menuSelected);
		mainView.mainMenu.menuBtn.backgroundImage = CB.Styles.imagePath + 'menu-btn-right.png';

		mainView.animate({
			duration : CB.__changeControllerDuration,
			left : -CB.screenWidth,
			top : 0
		}, function() {
			mainView.left = -CB.screenWidth;

			if (block !== undefined)
				block();
		});
	},
	openMenu : function(mainView, block) {
		mainView.mainMenu.add(mainView.mainMenu.mainMenuBar.menuSelected);
		mainView.mainMenu.menuBtn.backgroundImage = CB.Styles.imagePath + 'menu-btn-left.png';

		mainView.animate({
			duration : CB.__changeControllerDuration,
			left : -CB.screenWidth + (CB.screenWidth * 0.13),
			top : 0
		}, function() {
			mainView.left = -CB.screenWidth + (CB.screenWidth * 0.13);
			if (block !== undefined)
				block();
		});
	}
}
