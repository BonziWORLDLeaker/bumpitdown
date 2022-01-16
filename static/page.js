const fUtil = require("../misc/file");
const stuff = require("./info");
const http = require("http");

function toAttrString(table) {
	return typeof table == "object"
		? Object.keys(table)
				.filter((key) => table[key] !== null)
				.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(table[key])}`)
				.join("&")
		: table.replace(/"/g, '\\"');
}
function toParamString(table) {
	return Object.keys(table)
		.map((key) => `<param name="${key}" value="${toAttrString(table[key])}">`)
		.join(" ");
}
function toObjectString(attrs, params) {
	return `<object id="obj" ${Object.keys(attrs)
		.map((key) => `${key}="${attrs[key].replace(/"/g, '\\"')}"`)
		.join(" ")}>${toParamString(params)}</object>`;
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} url
 * @returns {boolean}
 */
module.exports = function (req, res, url) {
	if (req.method != "GET") return;
	const query = url.query;

	var attrs, params, title, script;
	switch (url.pathname) {
		case "/cc": {
			title = "Character Creator";
			script = "function characterSaved(){window.location.reload()}";
			attrs = {
				data: process.env.SWF_URL + "/cc.swf", // data: 'cc.swf',
				type: "application/x-shockwave-flash",
				id: "char_creator",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					original_asset_id: query["id"] || null,
					themeId: "business",
					ut: 60,
					bs: "default",
					appCode: "go",
					page: "",
					siteId: "go",
					m_mode: "school",
					isLogin: "Y",
					isEmbed: 1,
					ctc: "go",
					tlang: "en_US",
				},
				allowScriptAccess: "always",
				movie: process.env.SWF_URL + "/cc.swf", // 'http://localhost/cc.swf'
			};
			break;
		}

		case "/go_full": {
			let presave =
				query.movieId && query.movieId.startsWith("m")
					? query.movieId
					: `m-${fUtil[query.noAutosave ? "getNextFileId" : "fillNextFileId"]("movie-", ".xml")}`;
			title = "Video Editor";
			script = "";
			attrs = {
				data: process.env.SWF_URL + "/go_full.swf",
				type: "application/x-shockwave-flash",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					swfPath: process.env.SWF_URL + "/",
					isEmbed: 1,
					ctc: "go",
					ut: 50,
					bs: "default",
					appCode: "go",
					page: "",
					siteId: "go",
					lid: 13,
					isLogin: "Y",
					retut: 1,
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
					themeId: "business",
					tlang: "en_US",
					presaveId: presave,
					goteam_draft_only: 1,
					isWide: 1,
					collab: 0,
					nextUrl: "/html/list.html",
				},
				allowScriptAccess: "always",
			};
			break;
		}

		case "/player": {
			title = "Player";
			script = "console.log('Loading The Video Player...');";
			attrs = {
				data: process.env.SWF_URL + "/player.swf",
				type: "application/x-shockwave-flash",
				width: "100%",
				height: "100%",
			};
			params = {
				flashvars: {
					apiserver: "/",
					storePath: process.env.STORE_URL + "/<store>",
					ut: 60,
					autostart: 1,
					isWide: 1,
					clientThemePath: process.env.CLIENT_URL + "/<client_theme>",
				},
				allowScriptAccess: "always",
				allowFullScreen: "true",
			};
			break;
		}

		default:
			return;
	}
	res.setHeader("Content-Type", "text/html; charset=UTF-8");
	Object.assign(params.flashvars, query);
	res.end(
		`<!-- DOCTYPE html breaks it for some reason -->
<html lang="en">
<head>
	<meta charset="utf-8">
	<link rel="icon" href="/favicon.png" type="image/png">
	<title>${title}</title>
	<link rel="stylesheet" type="text/css" href="https://josephcrosmanplays532.github.io/PHPWrapper/pages/css/modern-normalize.css">
	<link rel="stylesheet" type="text/css" href="https://josephcrosmanplays532.github.io/PHPWrapper/pages/css/global.css">
	<link rel="stylesheet" type="text/css" href="https://josephcrosmanplays532.github.io/PHPWrapper/pages/css/swf.css">
</head>
<body>
<script>${script}</script>
<form style='display:none'id='uploadbanner'enctype='multipart/form-data'method='post'action='/upload_asset'target='dummy'><input type='text'name='params'/><input id='fileupload'name='import'type='file'onchange='importComplete(this)'accept='.mp3,.wav,.png,.jpg'/><input type='submit'value='submit'id='submit'/></form>
<script>
const fu=document.getElementById('fileupload'),sub=document.getElementById('submit');function showImporter(){fu.click()};function importComplete(obj){const file=obj.files[0];if(file!=undefined){const ext=file.name.substring(file.name.lastIndexOf('.')+1);var params=flashvars.presaveId+'.';if(ext=='mp3'||ext=='wav'){var c;while(c!='vo'&&c!='se'&&c!='mu'){c=document.getElementById('import_options_audio').toLowerCase().style.display='block'}params+=c}else if(ext=='jpg'||ext=='png'){var c;while(c!='bg'&&c!='prop'){c=document.getElementById('import_options_img').toLowerCase().style.display='block'}params+=c}obj.parentElement.firstChild.value=params+'.'+ext;sub.click();return true}}
</script>
<!-- Asset Importer -->
<div id="import_popup_container" style="display:none">
	<div id="import_popup">
		<h2 id="import-an-asset">Import an Asset</h2>
		<a class="close-button" href="javascript:hideImporter()">X</a>
		<p>Importing can be useful. especialy if you want to put custom assets into your video.</p>
		<!-- Import form -->
		<div id="import_image">
		<form id="import_options_img" style="display:none">
			<h3 id="import-as">Import As:</h3>
			<input type="radio" value="prop" name="subtype"> Prop</input>
			<br />
			<input type="radio" value="bg" name="subtype"> Background</input>
			<a class="button_import" href="javascript:submitImport()" onclick="document.getElementById('submit').click()">Import</a>
		</form>
		<form id="import_options_audio" style="display:none">
			<input type="radio" value="se" name="subtype"> Sound Effect</input>
			<br />
			<input type="radio" value="mu" name="subtype"> Music</input>
			<br />
			<input type="radio" value="vo" name="subtype"> Voiceover</input>
			<a class="button_import" href="javascript:submitImport()" onclick="document.getElementById('submit').click()">Import</a>
		</form>
		<button onclick="hideImporter()">CLOSE</button>
		</div>
	</div>
</div>
<!-- Video Previewer -->
<div id="preview_popup_container" style="display:none">
	<div id="preview_popup">
		<h2 id="preview-video">Preview Video</h2>
		<a class="close-button" href="javascript:hidePreviewer()">X</a>
		<object data="https://vyondlegacyoffical.herokuapp.com/static/animation/player.swf" type="application/x-shockwave-flash" id="preview_player">
			<!-- The flashvars are a huge mess, have fun looking at them. :) -->
			<param name="flashvars" value="apiserver=/&storePath=https://vyondlegacyoffical.herokuapp.com/static/store/<store>&ut=60&clientThemePath=https://vyondlegacyoffical.herokuapp.com/static/<client_theme>&isInitFromExternal=1&isWide=1&autostart=1">
			<param name="allowScriptAccess" value="always">
			<param name="allowFullScreen" value="true">
		</object>
	</div>
</div>
<!-- Video Studio -->
<main>
${toObjectString(attrs, params)}
</main>
<!-- Keeps the page from reloading on form submission -->
<iframe style="display:none" name="dummy"></iframe>
<script>
	////
	//// This JS contains important Video Studio stuff
	////
	
	///
	/// Variables
	///
	var previewPlayerTempData = "";
	const fu = document.getElementById('fileupload'),
		sub = document.getElementById('submit');
	///
	/// Previewer
	///
	function initPreviewPlayer(dataXmlStr, startFrame, containsChapter, themeList) {
		// New variable to be used by loadPreviewer()
		movieDataXmlStr = dataXmlStr;
		// Movie XML
		filmXmlStr = dataXmlStr.split("<filmxml>")[1].split("</filmxml>")[0];
		// Show preview popup
		document.getElementById("preview_popup_container").style.display = "block";
		// Load the Video Previewer
		loadPreviewer();
        }
	function loadPreviewer() {
		// I think this is in case of an error??
		if (movieDataXmlStr === null) {
			return;
		}
		// I don't know
		savePreviewData(movieDataXmlStr);
	}
	function savePreviewData(a) {
		// Set temp data variable
		previewPlayerTempData = a
	}
	function retrievePreviewPlayerData() {
		// Store in separate variable
		var recentPreviewPlayerTempData = previewPlayerTempData;
		// Clear original variable
		previewPlayerTempData = "";
		// Return recent temp data
		return recentPreviewPlayerTempData;
	}
	const fu=document.getElementById('fileupload'),sub=document.getElementById('submit');function showImporter(){fu.click()};function importComplete(obj){const file=obj.files[0];if(file!=undefined){const ext=file.name.substring(file.name.lastIndexOf('.')+1);var params=flashvars.presaveId+'.';if(ext=='mp3'||ext=='wav'){var c;while(c!='vo'&&c!='se'&&c!='mu'){c=document.getElementById('import_options_audio').toLowerCase().style.display='block'}params+=c}else if(ext=='jpg'||ext=='png'){var c;while(c!='bg'&&c!='prop'){c=document.getElementById('import_options_img').toLowerCase().style.display='block'}params+=c}obj.parentElement.firstChild.value=params+'.'+ext;sub.click();return true}}
	///
	/// Other stuff
	///
	// Redirect to Video Browser on Video Studio exit
	function exitStudio() {
		window.location = "/videos/";
	}
	// Hide interactive tutorial
	interactiveTutorial = {
		neverDisplay: function() {
			return true
		}
	};
	// Hide Video Previewer popup
	function hidePreviewer() {
		document.getElementById("preview_popup_container").style.display = "none";
	}
	// Hide Asset Importer popup
	function hideImporter() {
		document.getElementById("import_popup_container").style.display = "none";
	}
</script>
</body></html>`
	);
	return true;
};
