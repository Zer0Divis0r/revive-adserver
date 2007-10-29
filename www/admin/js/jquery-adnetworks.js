/**
 * Javascript required for Ad Networks screens
 *
 * Important: this code depends on jQuery.
 */

function initInlineEdit()
{
  $("span.start-edit").click(startInlineEdit);
  $("span.cancel-edit").click(cancelInlineEdit);
  $("span.cancel-add").click(cancelInlineAdd);
  $("#start-add").click(startInlineAdd);
  $("form[@id^='pub_form']").submit(submitInlineEdit);
}

function startInlineEdit()
{
  if (!$(this).is(".start-edit"))
  {
    return;
  }
  $("span.start-edit").not(this).removeClass("start-edit link").addClass("start-edit-disabled");
  $(this).parents("tr.inline-edit").removeClass("view").addClass("edit");
}

function cancelInlineEdit()
{
  $("span.start-edit-disabled").removeClass("start-edit-disabled").addClass("start-edit link");
  $(this).parents("tr.inline-edit").removeClass("edit").addClass("view");

  // Clear validation
  $("#url-empty").hide();
  $("#required-missing").hide();
}

function startInlineAdd()
{
  $(".inline-add").show();
  $("#urln").focus();
}

function cancelInlineAdd()
{
  $(".inline-add").hide();

  // Clear validation
  $("#url-empty").hide();
  $("#required-missing").hide();
}

function submitInlineEdit()
{
  var pubId = this.pubid.value;
  if (validatePublisher(this, "", pubId, ""))
  {
    if (!$("#adnetworks" + pubId).get(0).checked) {
      $("#adnetworks_hidden_" + pubId).get(0).value = 'f';
    }
    $("span.start-edit-disabled").removeClass("start-edit-disabled").addClass("start-edit link");
    if (adnetworksSettingsChanged(this)) {
      $("#adnetworks-signup-dialog_" + this.id).jqmShow();
    }
    else {
      return true; //allow submit
    }
  }
  return false; //bad form, stop submit
}

// Reimplement using jQuery validation plugin!
function validatePublisher(form, suffix, fieldSuffix, errorSuffix, customAction)
{
  $("#url-empty" + suffix + errorSuffix).hide();
  $("#required-missing" + suffix + errorSuffix).hide();

  if ($("#url" + fieldSuffix).get(0).value.length == 0)
  {
    $("#url" + fieldSuffix).addClass("inerror");
    $("#url-empty" + suffix + errorSuffix).show();
  }
  else
  {
    $("#url" + fieldSuffix).removeClass("inerror");
  }

  if ($("#adnetworks" + fieldSuffix).get(0).checked || $("#selfsignup" + fieldSuffix).get(0).checked)
  {
    if ($("#category" + fieldSuffix).get(0).selectedIndex == 0)
    {
      $("#category" + fieldSuffix).addClass("inerror");
      $("#required-missing" + suffix + errorSuffix).show();
    }
    else
    {
      $("#category" + fieldSuffix).removeClass("inerror");
    }

    if ($("#language" + fieldSuffix).get(0).selectedIndex == 0)
    {
      $("#language" + fieldSuffix).addClass("inerror");
      $("#required-missing" + suffix + errorSuffix).show();
    }
    else
    {
      $("#language" + fieldSuffix).removeClass("inerror");
    }

    if ($("#country" + fieldSuffix).get(0).selectedIndex == 0)
    {
      $("#country" + fieldSuffix).addClass("inerror");
      $("#required-missing" + suffix + errorSuffix).show();
    }
    else
    {
      $("#country" + fieldSuffix).removeClass("inerror");
    }
  }
  else
  {
    $("#country" + fieldSuffix).removeClass("inerror");
    $("#language" + fieldSuffix).removeClass("inerror");
    $("#category" + fieldSuffix).removeClass("inerror");
    $("#required-missing" + suffix + errorSuffix).hide();
  }

  if (customAction)
  {
    customAction(form, suffix, fieldSuffix);
  }

  var result = ($("#url" + fieldSuffix).get(0).value.length > 0) &&
         ( !($("#adnetworks" + fieldSuffix).get(0).checked || $("#selfsignup" + fieldSuffix).get(0).checked) || (
         $("#category" + fieldSuffix).get(0).selectedIndex > 0 &&
         $("#language" + fieldSuffix).get(0).selectedIndex > 0 &&
         $("#country" + fieldSuffix).get(0).selectedIndex > 0));

  return result;
}

function initPublisherAdd()
{
  $("#add_new_publisher_form").submit(validateNewPublisher);
}


function validateNewPublisher()
{
  if (validatePublisher(this, "", "n", ""))
  {
    if(this.adnetworks.checked) {
      $("#adnetworks-signup-dialog_" + this.id).jqmShow();
    }
    else {
      return true;
    }
  }
  return false;
}

function initCaptchaDialog(dialogId, formId, captchaURL)
{
  var form = $(formId);
  var signupDialog = $("#" + dialogId);
  
  var onShow = function(hash)
  { 
    var captcha = $("#captcha", hash.w);
    var time = new Date().getTime();
    $("#captcha-random").attr("value", time);
    captcha.attr("src", captchaURL + '&t=' +  time);
    hash.w.fadeIn("fast");
    $("input[@name='captcha-value']", signupDialog).get(0).focus(); 
  };  
  
  signupDialog.jqm(
   { modal: true,
      overlay: 40,
      onShow: onShow}).jqmAddClose($("#dg-cancel", signupDialog));

  if (badCaptcha(formId)) {
    $("#wrong-captcha", signupDialog).show();
    signupDialog.jqmShow();
  }
  else {
    $("#wrong-captcha", signupDialog).hide();
    signupDialog.hide();
  }

  $("#dg-submit", signupDialog).click(function() {
    this.form.submit();
  });
}

//This function search for an JS variable "captchaInError" indicating
//that the provided captcha was wrong.
//For the sake of the prototype it also checks the URL, which should be removed in
//the production code
function badCaptcha(myFormId)
{
  return (window.captchaFormId && window.captchaFormId == myFormId
    && window.captchaInError == true)
    || (document.URL.indexOf("captcha=0") != -1);
}


function initFindOtherNetworks()
{
  $("#findnetworksform select").change(function() {
    var country = $("select#country").attr("value");
    var language = $("select#language").attr("value");
    $("#other-networks-table").fadeOut("slow");
    $.get("./ajax/ajax-response-find-other-networks.php",
      { country: country, language: language },
      function(html) {
        $("#other-networks-table").empty().append(html);
	      $("#other-networks-table").fadeIn("slow");
      }
    );
  });
}

function initInstallerSites()
{
  $("#add-new-site").click(installerAddNewSite);
  $(".remove-site").click(installerRemoveSite);
  $(".site-url").keyup(checkAddSiteEnabled);
  initHelp();
  checkAddSiteEnabled();
}

function installerAddNewSite()
{
  var maxId = $("#max-id").get(0);
  maxId.value = parseInt(maxId.value) + 1;

  var clone = $("#site-proto").clone(true);
  clone.get(0).id = "site-cont" + maxId.value;
  $("#sites").append(clone).removeClass("one-site");

  $("#url-empty", clone).get(0).id += maxId.value;
  $("#required-missing", clone).get(0).id += maxId.value;
  $(":input", clone).each(function () {
    if ($.trim(this.id).length > 0)
    {
      this.id = this.id + maxId.value;
    }

  });
  $("label", clone).each(function () {
    if ($.trim(this.htmlFor).length > 0)
    {
      this.htmlFor += maxId.value;
    }
  });

  checkAddSiteEnabled();
}

function installerRemoveSite()
{
  $(this).parents(".site").remove();
  if ($("#sites .site").size() < 2) {
    $("#sites").addClass("one-site");
  }
  checkAddSiteEnabled();
}

function checkAddSiteEnabled()
{
  var enabled = true;
  $("#sites .site-url").each(function(i) {
    if ($.trim(this.value).length == 0)
    {
      enabled = false;
    }
  });

  $("#add-new-site").get(0).disabled = !enabled;
  if (enabled)
  {
    $("#add-new-site-info").fadeOut("fast");
  }
  else
  {
    $("#add-new-site-info").fadeIn("fast");
  }
}


function installerValidateSites()
{
  var maxId = $("#max-id").get(0).value;
  var form = $("#frmOpenads").get(0);
  var valid = true;

  for (var i = 1; i <= maxId; i++)
  {
    if ($("#url" + i).get(0))
    {
      valid = valid && validatePublisher(form, "", i + "", i + "", function(form, suffix, fieldSuffix) {
        if ($("#url" + fieldSuffix).get(0).value.length == 0)
        {
          $("#site-cont" + fieldSuffix).addClass("url-error");
        }
        else
        {
          $("#site-cont" + fieldSuffix).removeClass("url-error");
        }
      });
    }
  }

  return valid;
}


function isCaptchaRequired()
{
  var form = $("#frmOpenads").get(0);
  var signupRequested = false;

  $(":checkbox[id^=adnetworks], :checkbox[id^=selfsignup]", form).each(function() {
    if (this.checked) {
      signupRequested = true;
      return false;
    }
  });

  return signupRequested;
}


function initInstallerTags()
{
  $("#tag-type").change(tagTypeChanged);
  $("#ad-size").change(adSizeChanged);
  $("#site").change(siteChanged);
  $('pre').bind('mouseover', selectElement);
}

function tagTypeChanged()
{
  if (this.value == "js")
  {
    $("#header-script").show();
  }
  else
  {
    $("#header-script").hide();
  }

  $("pre.invocation-codes:not(." + this.value + ")").hide();
  $("pre.invocation-codes").filter("." + this.value).show();
}

function adSizeChanged()
{
  if (this.value == "*")
  {
    $(".zone-cont").show();
  }
  else
  {
    $(".zone-cont:not(." + this.value + ")").hide();
    $("." + this.value).show();
  }
}

function siteChanged()
{
  if (this.value == "*")
  {
    $(".publisher-cont").show();
  }
  else
  {
    $(".publisher-cont").hide();
    $("#" + this.value).show();
  }
}


function initHelp() 
{
  $(".adnetworks-help").add(".selfsignup-help").click(showHelp);
  $(".popup-help").click(hideOaHelp);
}

function showHelp()
{
  $(".popup-help").fadeOut("fast");
  $(this).prev().fadeIn("fast").css("display", "inline");
}

function hideOaHelp()
{
  $(this).fadeOut("fast");
}

function selectElement()
{
  if (window.getSelection)
  {

  
    var r = document.createRange();
    r.selectNodeContents($(this)[0]);
    var s = window.getSelection();
    if (s.rangeCount)
    {
      s.collapseToStart();
      s.removeAllRanges();
    }
    s.addRange(r);
  }
  else if (document.body.createTextRange)
  {
    var r = document.body.createTextRange();
    r.moveToElementText($(this)[0]);
    r.select();
  }
}

function adnetworksSettingsStore(form)
{
  if (document.adnetworks == undefined) {
    document.adnetworks = new Array();
  }
  var adnetworks = document.adnetworks;
  var formSettings = new Array();
  if (form.adnetworks) {
    formSettings["adnetworks"] =  form.adnetworks.checked;
  }
  if (form.selfsignup) {
    formSettings["selfsignup"] =  form.selfsignup.checked;
  }
  if (form.country) {
   formSettings["country"] =  form.country.value;
  }
  if (form.language) {
   formSettings["language"] =  form.language.value;
  }
  if (form.category) {
   formSettings["category"] =  form.category.value;
  }

  adnetworks[form.id] = formSettings;
  document.adnetworks = adnetworks;
}


function adnetworksSettingsChanged(form)
{
  if (document.adnetworks == undefined || document.adnetworks[form.id] == undefined ) {
    return false;
  }

  var formSettings = document.adnetworks[form.id];
  var result = false;  
  //show captcha if 
  // 1) signing  up
  result = (form.adnetworks && 
    formSettings["adnetworks"] == false && form.adnetworks.checked);
    
  // 2) already signed up and changed cat/lang/cntry
  result = result || (form.adnetworks && formSettings["adnetworks"] == true &&  
    form.adnetworks.checked) &&  
    ((form.country && formSettings["country"] !=  form.country.value)
      || (form.language  && formSettings["language"] !=  form.language.value)
      || (form.category && formSettings["category"] !=  form.category.value));
      
  //when unsigning or signed up and no changes do nothing
  return result;    
}

/** Advertisers and campaigns **/
function initRejectedOARows()
{
	$(".oa td.sts:contains('Rejected')").each(function() {
    var cell = $(this);
    var statusRow = cell.parents("tr").next("tr").hide();     

    cell.css("color", "green").click(function() {
      statusRow.show();    	
    });
	});
}

function initCampaignStatus()
{
    var statusRows = $("[@id^='rsn_row']");
    
    if ($("#sts_reject").get(0).checked == false ) {
        statusRows.hide();
    }
    
    
    
    $("input[name='status']").change(function(){
        if (this.value == "reject") {
            statusRows.show();    
        }
        else {
            statusRows.hide();
        }
    });
}

/** Affiliate delete dialog */
function initAffiliateDeleteDialog()
{
  $("#affiliate-delete-dialog").jqm({
      modal: true,
      overlay: 40,
      trigger: ".ad-delete-show",
      onShow: function(hash) {
        var pubId = $(".affId", hash.t).text();
        var pubForm = $("#pub_form_" + pubId).get(0);
        $(".deleted-affiliate", hash.w).text(pubForm.websiteUrl.value);
        var delForm = $("#affiliate_delete_form").get(0);
        delForm.affiliateid.value = pubId;
        delForm.deleteall.checked = false;
        hash.w.fadeIn("fast");
      } 
  }).jqmAddClose("#ad-cancel");
}


function initSuggestAdnetworks()
{
  var $suggestPane = $("#adnetwork-suggest");
  
  $(".suggest-adnetwork-show").click(function() {
    $("#find-adnetworks-body").hide();
    $suggestPane.fadeIn("fast", function() {
      $(":input:visible:first", $suggestPane).get(0).focus();
    });
    return false;
  });

  $(".suggest-adnetwork-cancel").click(function() {
    $suggestPane.hide();
    $("#find-adnetworks-body").fadeIn("fast");
    return false;
  });
  
  
  $("#suggestAdnetworksForm").submit(function() {
    if (max_formValidate(this)) {
        $("#captcha-dialog-" + this.id).jqmShow();
    }
    return false;
  });
  
  
  $(".remove-row", $suggestPane).click(function() {
    $(this).parent("[id^='o-network']").remove();
	  checkAddNetworkEnabled();
	  checkRemoveNetworkEnabled();
  });  
  
  $("#add-new-adnetwork", $suggestPane).click(addNewAdnetwork);

  $(":input", $suggestPane).keyup(checkAddNetworkEnabled)
    .mouseup(checkAddNetworkEnabled);
 
  //copy validation constraints from proto to alreadt visible rows         
  var $proto =$(".proto", $suggestPane);
  $(":input", $proto).each(function () {
    var protoInput = this; 
    $(".networks [id^='" + this.id + "']", $suggestPane).each(function() {
      copyValidationConstraints(protoInput, this);
    })
  });
    
  checkAddNetworkEnabled();
  checkRemoveNetworkEnabled();
}


function addNewAdnetwork()
{
  var $suggestPane = $("#adnetwork-suggest");

  var maxId = $("#max-id", $suggestPane).get(0);
  maxId.value = parseInt(maxId.value) + 1;
  var $proto =$(".proto", $suggestPane);
  var $clone = $(".proto", $suggestPane).clone(true);
  $clone.removeClass("hide proto");
  $clone.get(0).id = "o-network" + maxId.value;
  $(".networks", $suggestPane).append($clone);

  $(":input", $clone).each(function () {
    copyValidationConstraints($("#" +  this.id, $proto).get(0), this);
  
    if ($.trim(this.id).length > 0)
    {
      this.id = this.id + maxId.value;
    }

  });
  $("label", $clone).each(function () {
    if ($.trim(this.htmlFor).length > 0)
    {
      this.htmlFor += maxId.value;
    }
  });

  checkAddNetworkEnabled();
  checkRemoveNetworkEnabled();
}


function copyValidationConstraints(fromObj, toObj)
{
  toObj.validateCheck = fromObj.validateCheck;
  toObj.validateReq = fromObj.validateReq;
  toObj.validateDescr = fromObj.validateDescr;
}


function checkRemoveNetworkEnabled()
{
  var $buttons = $("#adnetwork-suggest").find(".networks").find(".remove-row");
  $buttons.length == 1 ? $buttons.addClass("hide") : $buttons.removeClass("hide");
}


function checkAddNetworkEnabled()
{
  var $suggestPane = $("#adnetwork-suggest");
  var $adnetworks = $(".networks", $suggestPane);
  var enabled = true;

  $(":input:not(:hidden)", $adnetworks).each(function(i) {
    if ($.trim(this.value).length == 0)
    {
      enabled = false;
    }
  });

  $("#add-new-adnetwork", $suggestPane).get(0).disabled = !enabled;
  enabled ? $("#add-new-info", $suggestPane).fadeOut("fast") 
                : $("#add-new-info", $suggestPane).fadeIn("fast");
}

