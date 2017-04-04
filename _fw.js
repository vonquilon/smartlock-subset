
var MasterClass = {
	slCancelCookieName: 'smartLockCanceled',

	__init:function () {
		$(document).ready(function(){
			if (typeof mfw.ready=='function') {
				mfw.ready();
				if (typeof mfw._ready=='function') {
					mfw._ready();
				}
			} else {
				mfw.__ready();
			}
		});
	},

	__ready:function() {
		mfw.smartLock(true);
	},

	smartLock: function(unmediated, redirectLink) {
		var bodyObj = $('body');
		var slCanceled = mfw.cookies.readCookie(mfw.slCancelCookieName);
		var isPageIncluded = bodyObj.hasClass('_Home') || bodyObj.hasClass('_Category') || bodyObj.hasClass('_Product') || bodyObj.hasClass('_ShoppingCart');

		if (navigator.credentials && (isPageIncluded || redirectLink) && !mfw.cookies.readCookie('logonId') && !slCanceled) {
			navigator.credentials.get({
				password: true,
				unmediated: unmediated
			}).then(function(cred) {
				if (cred) {
					if (cred.type == 'password') {
						var prevClass;
						if (bodyObj.hasClass('light')) {
							bodyObj.removeClass('light');
							prevClass = 'light';
						}
						bodyObj.addClass("show_overlay spinner");
						$('#_overlay').css({'z-index':'5000','top':'0'});
						logInFetch(cred).then(function(res) {
							if (res.status == 200) {
								res.text().then(function(data) {
									var errMsg = $(data).find('form#Logon font[color="red"]');
									if (errMsg.length) {
										bodyObj.removeClass("show_overlay spinner");
										if (prevClass) {
											bodyObj.addClass(prevClass);
										}
										$('#_overlay').css({'z-index':'','top':''});
										alert(errMsg.text());
										mfw.cookies.writeCookie(mfw.slCancelCookieName, 'true');
										if (redirectLink) {
											window.location = redirectLink;
										}
									} else {
										navigator.credentials.store(cred).then(function() {
											document.location.reload();
										}, function() {
											document.location.reload();
										});
									}
								});
							} else {
								document.location.reload();
							}
						});
					}
				} else {
					if (!unmediated) {
						mfw.cookies.writeCookie(mfw.slCancelCookieName, 'true');
					}
					if (redirectLink) {
						window.location = redirectLink;
					}
				}
			}, function() {
				if (redirectLink) {
					window.location = redirectLink;
				}
			});

			function logInFetch(cred) {
				cred.idName = 'logonId';
				cred.passwordName = 'logonPassword';
				cred.additionalData = new URLSearchParams();
				cred.additionalData.append('storeId', '20051');
				cred.additionalData.append('origStoreId', '20051');
				cred.additionalData.append('catalogId', '13302');
				cred.additionalData.append('ddkeyVal', 'https:AjaxLogonForm');
				cred.additionalData.append('isSessionTimeOut', '');
				cred.additionalData.append('reLogonURL', 'LogonForm');
				cred.additionalData.append('fromOrderId', '*');
				cred.additionalData.append('toOrderId', '.');
				cred.additionalData.append('deleteIfEmpty', '*');
				cred.additionalData.append('continue', '1');
				cred.additionalData.append('createIfEmpty', '1');
				cred.additionalData.append('calculationUsageId', '-1');
				cred.additionalData.append('updatePrices', '1');
				cred.additionalData.append('previousPage', 'logon');
				cred.additionalData.append('rememberMe', 'false');
				cred.additionalData.append('SEOURL', '');
				cred.additionalData.append('URL', '/AjaxLogonForm');
				cred.additionalData.append('URL', '/AjaxLogonForm');
				cred.additionalData.append('undefined', 'Y');
				cred.additionalData.append('undefined', 'N');
				cred.additionalData.append('gplusclientId', '129570946981.apps.googleusercontent.com');
				cred.additionalData.append('undefined', '20051');
				cred.additionalData.append('undefined', '13302');
				cred.additionalData.append('urlRedirect', 'TopCategoriesDisplayView');
				cred.additionalData.append('headerUrl', 'TopCategoriesDisplayView');
				return fetch('/webapp/wcs/stores/servlet/Logon', {
					method: 'POST',
					credentials: cred,
					redirect: 'follow'
				});
			}
		}
		if ((!navigator.credentials || slCanceled) && redirectLink) {
			window.location = redirectLink;
		}
	},
	
	smartLockLogOut: function() {
		if (navigator.credentials) {
			mfw.cookies.deleteCookie(mfw.slCancelCookieName);
			navigator.credentials.requireUserMediation();
		}
	}

};