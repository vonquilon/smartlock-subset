var account_Signin = Extend(MasterClass,{
	init:function(){
		mfw.__init();
	},
	ready:function() {
		var o = this;

		mfw.__ready();
		
		o.smartLockLogIn();
	},
	smartLockLogIn: function() {
		if (navigator.credentials) {
			var bodyObj = $('body'),
				logInForm = $('form[data-id="Logon"]').off('submit').submit(smartLockSubmit),
				realForm = $('#'+logInForm.attr('data-id')),
				logInBtn = logInForm.find('button[data-id="default"]').removeAttr('onclick'),
				realLogInBtn = $('#'+logInBtn.attr('data-id')),
				unmediated = mfw.cookies.readCookie(mfw.slCancelCookieName)?true:false;

			if ($('#__errorMsg:hidden').length) {
				navigator.credentials.get({
					password: true,
					unmediated: unmediated
				}).then(function(cred) {
					if (cred) {
						if (cred.type == 'password') {
							logInForm.find('input[data-id="logonId"]').val(cred.id);
							// stop user from signing in
							logInForm.off('submit').submit(function(e) {
								// do nothing
								e.preventDefault();
							});
							logInBtn.prop('type', 'button');
							logInFetch(cred, function() {
								logInForm.off('submit').submit(smartLockSubmit);
								logInBtn.prop('type', 'submit');
							});
						}
					} else {
						if (!unmediated) {
							mfw.cookies.writeCookie(mfw.slCancelCookieName, 'true');
						}
					}
				});
			}

			function smartLockSubmit(e) {
				$(this).find('input:focus').blur();
				var id = realForm.find('#logonId').val().trim();
				var password = realForm.find('#logonPassword').val();
				if (!id || !password) {
					bodyObj.addClass("show_overlay spinner");
					realForm.submit();
				} else {
					var cred = new PasswordCredential({
						id: id,
						password: password
					});
					logInFetch(cred);
				}
				e.preventDefault();
			}

			function logInFetch(cred, funcToCall) {
				console.log("SIGN-IN!!!");
				bodyObj.addClass("show_overlay spinner");
				cred.idName = 'logonId';
				cred.passwordName = 'logonPassword';
				cred.additionalData = new URLSearchParams();
				realForm.find('._hidden input[type="hidden"]').each(function() {
					cred.additionalData.append($(this).attr('name'), $(this).attr('value'));
				});
				fetch('/webapp/wcs/stores/servlet/Logon', {
					method: 'POST',
					credentials: cred,
					redirect: 'follow'
				}).then(function(res) {
					if (res.status == 200) {
						res.text().then(function(data) {
							var errMsg = $(data).find('form#Logon font[color="red"]');
							if (errMsg.length) {
								bodyObj.removeClass("show_overlay spinner");
								realForm.find('._hidden input[type="hidden"][name="URL"]').attr('value', $(data).find('._hidden input[type="hidden"][name="URL"]').attr('value'));
								$('#__errorMsg').text(errMsg.text())
									.removeClass('hide').parent().parent().removeClass('force_hide hide');
								if (funcToCall) { funcToCall(); }
							} else {
								navigator.credentials.store(cred).then(function() {
									document.location = res.url;
								}, function() {
									document.location = res.url;
								});
							}
						});
					} else {
						document.location.reload();
					}
				});
			}
		}
	}
	
});
