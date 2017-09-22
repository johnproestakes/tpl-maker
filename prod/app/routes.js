angular.module("templateMaker").config(["$routeProvider", function ($routeProvider) {
        $routeProvider
            .when('/login', {
            template: "<style type=\"text/css\">\n    body {\n      background-color: #DADADA;\n    }\n    body > .grid {\n      height: 100% !important;\n    }\n    #app_body {height:100%;}\n    .image {\n      margin-top: -100px;\n    }\n    .column {\n      max-width: 450px;\n\n    }\n    ng-view{height:100%;}\n  </style><div class=\"ui middle aligned center aligned grid\" style=\"height: 100%;\">\n  <div class=\"column\">\n    <h2 class=\"ui purple centered image header\">\n      <img class=\"ui image\" src=\"assets/logo128.png\"/>\n      <div class=\"content\">\n      {{ loginTimer ? \"Logging you in to Template Maker ...\" : \"Log-in to use Template Maker\"}}\n\n      </div>\n    </h2>\n    <form class=\"ui large form\">\n      <div>\n        <div class=\"field\">\n          <div class=\"ui left icon input\" ng-class=\"{disabled: loginTimer}\">\n            <i class=\"user icon\"></i>\n\n            <input type=\"text\" placeholder=\"Enter your email address\" ng-model=\"sessionUserEmail\" >\n\n          </div>\n        </div>\n        <div class=\"ui large purple button\" ng-if=\"!loginTimer\" ng-click=\"sessionUpdateUserEmail(sessionUserEmail)\">Login</div>\n        <div class=\"ui large purple button\" ng-if=\"loginTimer\" ng-click=\"loginAsOther()\">Cancel login</div>\n        <div class=\"ui small inline loader\" ng-class=\"{active: loginTimer}\"></div>\n      </div>\n\n      <div class=\"ui red message\" ng-if=\"errorMessage\">{{errorMessage}}</div>\n      <div class=\"\" ng-if=\"!loginTimer\" style=\"text-align: left;\"><br><strong>Great news: You do not need a password.</strong>\n      <br><br> However, you will have to provide a valid email address before using Template Maker. You should only need to do this one time; Your email address will be stored in your browser and used to log you in next time. If you clear your cache or your browser loses your saved email address, you will need to input it again. Your email address is not tracked or saved in Google Analytics, a hash is generated and identifies you as a single user across browsers and dynamic IP Addresses.</div>\n    </form>\n\n\n  </div>\n</div>"
        })
            .when('/main', {
            template: "\n\n    <h1>{{templateList.length==0 ? \"Drag in your templates\" : \"Templates\"}}</h1>\n    <div>\n    <div ng-show=\"templateList.length>0\">\n    <div class=\"ui relaxed divided list\">\n      <div class=\"item\" ng-repeat=\"(key, item) in templateList track by $index\">\n        <i class=\"large file outline middle aligned icon\"></i>\n        <div class=\"content\">\n          <div class=\"header\">{{item.name}}</div>\n          <div class=\"description\">{{item.size}}</div>\n        </div>\n      </div>\n    </div>\n    </div>\n\n\n    <file-dropper ng-show=\"templateList.length==0\" ondrop=\"dropTemplateFiles()\" label=\"Drop files here\"></file-dropper>\n<br>\n\n\n    <div class=\"ui fixed container\">\n      <div class=\"ui container\">\n        <button class=\"ui button\" ng-class=\"{disabled: templateList.length==0}\" ng-click=\"blankSlate()\">Change templates</button>\n        <button class=\"ui right floated button\" ng-click=\"templateLoaded()&&navigateTo('#/fields')\" ng-class=\"{disabled: templateList.length==0, primary: templateList.length>0}\">Continue  <i class=\"long right arrow icon\"></i></button>\n        </div>\n      </div>\n\n\n    </div>"
        })
            .when('/build-tag', {
            controller: 'TagBuilderController',
            template: "\n\n\n    <h1 class=\"ui center aligned header\">\n\n      Tag Builder\n    </h1>\n      <div class=\"ui form\">\n      <div class=\"field\">\n        <label>Tag Label</label>\n        <p>This is the \"good name\" of this field, and will appear on the field list instead of the tag name.</p>\n        <input type=\"text\" ng-blur=\"updateNameFromLabel(data.tagLabel)\" ng-model=\"data.tagLabel\">\n        </div>\n      <div class=\"field\">\n        <label>Tag Name</label>\n        <p>This is the unique ID of the tag you are creating.</p>\n        <input type=\"text\" ng-model=\"data.tagName\">\n        </div>\n      <div class=\"field\">\n        <label>Tag Type</label>\n        <select class=\"ui dropdown\" ng-model=\"data.tagType\">\n        <option ng-repeat=\"item in fieldOptions\" value=\"{{item.value}}\">{{item.label}}</option>\n          </select>\n        </div>\n        <div class=\"ui blue message\" ng-if=\"canAccessParameter('dateFormat')\">\n      <div class=\"dateFormat field\" >\n        <div class=\"header\">Date Format</div>\n        <p>This is how you can specify a date format</p>\n        <div class=\"ui grid\">\n          <div class=\"eight wide column\">\n          <select class=\"ui dropdown\" ng-model=\"data.dateFormat\" ng-if=\"!dateFormat.custom\">\n          <option ng-repeat=\"item in dateFormat.options\" value=\"{{item}}\">{{item}}</option>\n            </select>\n          <input type=\"text\" ng-model=\"data.dateFormat\" ng-if=\"dateFormat.custom\"/>\n          <div class=\"ui checkbox\">\n          <input type=\"checkbox\" ng-model=\"dateFormat.custom\"> <label>Use custom pattern.</label></div>\n          </div>\n          <div class=\"eight wide column\">\n          <strong>Here is a preview:</strong><br>\n          {{ getDatePreview( data.dateFormat) }}\n          </div>\n\n          </div>\n\n\n        </div></div>\n        <div class=\"ui yellow message\" ng-if=\"canAccessParameter('timeFormat')\">\n        <div class=\"timeFormat field\" >\n          <div class=\"header\">Time Format</div>\n          <p>This is how you can specify a time format</p>\n          <div class=\"ui grid\">\n            <div class=\"eight wide column\">\n            <select class=\"ui dropdown\" ng-model=\"data.timeFormat\" ng-if=\"!timeFormat.custom\">\n            <option ng-repeat=\"item in timeFormat.options\" value=\"{{item}}\">{{item}}</option>\n              </select>\n            <input type=\"text\" ng-model=\"data.timeFormat\" ng-if=\"timeFormat.custom\"/>\n            <div class=\"ui checkbox\">\n            <input type=\"checkbox\" ng-model=\"timeFormat.custom\"> <label>Use custom pattern.</label></div>\n            </div>\n            <div class=\"eight wide column\">\n            <strong>Here is a preview:</strong><br>\n            {{ getTimePreview( data.timeFormat) }}\n            </div>\n            </div>\n\n\n\n          </div></div>\n\n          <div class=\"ui message\">\n          <div class=\"header\">Optional Attributes</div><br>\n        <div class=\"field\" ng-if=\"canAccessParameter('length')\">\n          <label>Length</label>\n          <p ng-if=\"data.tagType=='text'\">Setting this field to a numerical value will prevent the user from inputting a text value longer than the specified number of characters.</p>\n          <p ng-if=\"data.tagType=='repeat'\">This will limit the number of items that can be added to a repeating block.</p>\n          <input type=\"text\" ng-model=\"data.tagLength\">\n          </div>\n\n        <div class=\"field\" ng-if=\"canAccessParameter('required')\">\n          <label>Required</label>\n\n          <div class=\"ui checkbox\">\n          <input type=\"checkbox\" ng-model=\"data.tagRequired\">\n          <label>Checking this box makes this field required before the user can export the template.\n          </label>\n          </div>\n          </div>\n\n          <div class=\"field\" ng-if=\"canAccessParameter('instructions')\">\n            <label>Instructions</label>\n            <p>You can provide simple instructions to the user on the field list to further explain what the tag is an how it is used, if necessary.</p>\n            <input type=\"text\" ng-model=\"data.tagInstructions\">\n            </div>\n            </div>\n            <div class=\"field\" ng-show=\"data.tagName\">\n            <label>Rendered Tag</label>\n              <textarea>{{ renderedPreview() }}</textarea>\n              </div>\n            <div >\n\n            </div>\n              <div style=\"height:100px;\"></div>\n        </div>\n        <div class=\"ui fixed container\">\n          <div class=\"ui container\">\n          <button class=\"ui button\" ng-click=\"resetForm()\">Reset</button>\n          </div>\n          </div>\n\n\n\n\n    "
        })
            .when('/fields', {
            template: "\n    <div style=\"float:right\">\n    <div class=\"inline field\">\n    <div class=\"ui checkbox\">\n      <input type=\"checkbox\" tabindex=\"0\" ui-switch ng-model=\"canLivePreview\">\n      <label>Enable Live Preview (Beta)</label>\n    </div>\n  </div>\n\n      </div>\n    <h1>Fields</h1>\n    <div class=\"ui form\">\n\n        <div class=\"ui field\" ng-repeat=\"field in fields track by $index\">\n\n          <label>{{field.label ? field.label : field.clean}}<span ng-if=\"field.required\">*</span></label>\n          <p ng-if=\"field.instructions\">{{field.instructions}}</p>\n          <tpl-textarea ng-model=\"field.model\" field=\"field\" ng-change=\"updateFieldValue(field, field.model)\" ng-if=\"field.type=='textarea'\"></tpl-textarea>\n          <tpl-textbox ng-model=\"field.model\" field=\"field\" ng-change=\"updateFieldValue(field, field.model)\" ng-if=\"field.type=='text'\"></tpl-textbox>\n          <tpl-url ng-model=\"field.model\" field=\"field\" ng-change=\"updateFieldValue(field, field.model)\" ng-if=\"field.type=='url'\"></tpl-url>\n          <tpl-date ng-model=\"field.model\" field=\"field\" ng-change=\"updateFieldValue(field, field.model)\" ng-if=\"field.type=='date'\"/></tpl-date>\n          <tpl-repeat ng-model=\"field.model\" field=\"field\" ng-change=\"updateFieldValue(field, field.model)\" ng-if=\"field.type=='repeat'\"/></tpl-date>\n          <tpl-time ng-model=\"field.model\" field=\"field\" ng-change=\"updateFieldValue(field, field.model)\" ng-if=\"field.type=='time'\"/></tpl-time>\n          </div>\n\n        </div>\n      </div><br>\n\n        <div ng-show=\"fields.length>0\" style=\"padding-bottom:3em; padding-top:2em;\">\n        <div class=\"ui horizontal divider\">\n\n    </div>\n\n        </div>\n        <div class=\"ui fixed container\">\n        <div class=\"purple\" style=\"background-color: #A333C8; color: #fff;\" ng-if=\"canLivePreview\">\n        <div class=\"ui container\" style=\"margin-top:0; margin-bottom:0;padding:.5em;\">\n          <i class=\"warning sign icon\" ng-hide=\"livePreview!==''\"></i>\n          <i class=\"check icon\" ng-show=\"livePreview!==''\"></i>\n          Live preview\n          <div style=\"float:right; width: 50%;\">\n              <div class=\"ui pointing dropdown\" ui-dropdown>\n                {{livePreview!==\"\" ? livePreviewName : \"Select a template to preview\" }} <i class=\"dropdown icon\"></i>\n                <div class=\"menu\">\n                  <div class=\"item\" ng-repeat=\"(key, item) in templateList track by $index\" ng-click=\"setLivePreviewTemplate(key)\">{{item.name}}</div>\n                  </div>\n                </div>\n                </div>\n          </div>\n          </div>\n          <div class=\"ui container\">\n            <button class=\"ui button\" ui-popup popup-id=\"import_popup\">\n            <i class=\"folder open icon\"></i> Import field values</button>\n            <div class=\"ui popup\" id=\"import_popup\">\n              <div class=\"header\">Import saved field values</div>\n              <p style=\"padding-top:.5em;\">If you have a field value file (*.JSON), you can drop it in the box below to update the above fields. You can create a field value file on the export page after you've filled out the fields above. </p>\n              <file-dropper label=\"Drop JSON file here\" ondrop=\"dropImportFieldValues()\"></file-dropper>\n            </div>\n            <button ng-click=\"areAllFieldsCompleted()&&navigateTo('#/export')\" class=\"ui right floated\" ng-class=\"{'disabled button': !areAllFieldsCompleted(), 'primary button':areAllFieldsCompleted()}\">Review and export <i class=\"long right arrow icon\"></i></button>\n            </div>\n          </div>\n\n\n      "
        })
            .when('/export', {
            template: "\n\n    <h1>Export</h1>\n    <div ng-show=\"templateList.length==0\">\n      There are no templates to export.\n      </div>\n    <div ng-show=\"templateList.length>0\">\n    <div class=\"ui relaxed divided list\">\n      <div class=\"item\" ng-repeat=\"(key, item) in templateList track by $index\">\n      <div class=\"right floated content\">\n\n        <div class=\"ui buttons\">\n          <div class=\"ui button\" ng-click=\"exportDownloadSingleFile(item)\">Download</div>\n          <div class=\"ui simple dropdown icon button\">\n            <i class=\"dropdown icon\"></i>\n            <div class=\"menu\">\n\n              <div class=\"item\" ng-click=\"previewHTML(item)\">Open in browser</div>\n              </div>\n            </div>\n          </div>\n      </div>\n\n        <i class=\"large file outline middle aligned icon\"></i>\n        <div class=\"content\">\n          <div class=\"header\">{{item.name}}</div>\n          <div class=\"description\">{{item.size}}B</div>\n        </div>\n      </div>\n\n    <div class=\"item\">\n      <div class=\"right floated content\">\n        <button class=\"ui button\" ng-click=\"exportFields()\" >Download</button>\n      </div>\n\n        <i class=\"large text file outline middle aligned icon\"></i>\n        <div class=\"content\">\n          <div class=\"header\">Field values</div>\n          <div class=\"description\"></div>\n        </div>\n      </div>\n    </div>\n<br>\n\n\n\n<div class=\"ui fixed container\">\n  <div class=\"ui container\">\n    <button class=\"ui primary right floated button\" ng-click=\"exportAllTemplates()\">\n    <i class=\"download icon\"></i> Download All</button>\n    <button class=\"ui button\" ng-click=\"blankSlate()\">Start over</button>\n      </div>\n    </div>\n  </div>\n\n    "
        }).when('/help', {
            template: "\n    <h1>Help</h1>\n\n    <p>Variables have changed in the new version of template maker. The new format follows the pattern below:</p>\n\n    <pre>{{ variable_name | type: format }}</pre>\n\n    <p>For example:</p>\n    <pre>{{ webinar_date | date: \"longDate\" }}</pre>\n\n\n    <p>For text fields you can specify long text and regular text boxes:</p>\n    <pre>{{ webinar_title }}\n{{ webinar_description | textarea }}</pre>\n\n    <h2>Validation</h2>\n    <p>You can add a character count limitation to regular textboxes.</p>\n    <pre>{{ webinar_title | length: 45 }}</pre>\n\n    <p>You can require a field to be filled out using the required parameter.</p>\n    <pre>{{ webinar_title | required }}</pre>\n\n    <p>You can add validation for a url by specifying a url type:</p>\n    <pre>{{ webinar_attendee_url | url }}</pre>\n    <p>These urls will have to be a URL in order for you to export the files.</p>\n\n\n    <h2>Date Formats</h2>\n    <p>One cool thing that you can do, is display the date in a more\n    customizable way. What you'll notice immediately is that\n    you can only specify a date in a rigid YYYY-MM-DD format. On the template\n    variable you can specify the month as either the standard date format,\n    or something more unique-- a couple examples:</p>\n    <table class=\"ui table\">\n    <thead><tr><th>Code</th><th>Renders</th></tr></thead>\n    <tr><td><code>{{ webinar_date | date: \"longDate\" }}</code></td><td> September 3, 2010</td></tr>\n    <tr><td><code>{{ webinar_date | date: \"fullDate\" }}</code></td><td> Friday, September 3, 2010</td></tr>\n    <tr><td><code>{{ webinar_date | date: \"MMMM\" }}</code></td><td> September</td></tr>\n    <tr><td><code>{{ webinar_date | date: \"yyyyMMdd\" }}</code></td><td> 20170903</td></tr>\n    </table>\n\n    <h2>Time Formats</h2>\n    <p>You can display times using the time tag:</p>\n\n    <table class=\"ui table\">\n    <thead><tr><th>Code</th><th>Renders</th></tr></thead>\n    <tr><td><code>{{ webinar_time_start | time: \"shortTime\" }}</code></td><td> 2:00 PM</td></tr>\n    <tr><td><code>{{ webinar_time_end | time: \"shortTime+ZZZ\" }}</code></td><td> 2:00 PM EST</td></tr>\n    <tr><td><code>{{ webinar_time_start | time: \"optumTime\" }}</code></td><td> 2:00 p.m.</td></tr>\n    <tr><td><code>{{ webinar_time_end | time: \"optumTime+ZZZ\" }}</code></td><td> 2:00 p.m. EST</td></tr>\n    <tr><td><code>{{ webinar_time_start | time: \"hh:mm\" }}</code></td><td> 2:00</td></tr>\n    <tr><td><code>{{ webinar_time_start | time: \"UTC\" }}</code></td><td> T180000Z <br>UTC adds 4 hours from EST.</td></tr>\n    </table>\n\n\n    <h2>Loops</h2>\n    <p>Below is an example code for creating repeating blocks of variables. Notice how the variables inside a repeating block are wrapped with hashtags.</p>\n    <code><pre>\n    {{ webinar_speakers | repeat: `\n      {{ speaker_name | length: 128 }} &lt;br/&gt;\n      {{ job_title | length: 128 }} &lt;br/&gt;\n      {{ description | length: 128 }} &lt;br/&gt;\n\n    ` }}\n    </pre></code>\n\n    <div style=\"height: 50px;\"></div>\n    " })
            .otherwise({ redirectTo: "/login" });
    }]);
