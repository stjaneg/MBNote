$(function(){

	$("#status").hide(0);
	//建立、開啟資料庫
	var db;
	var dbSize = 2 * 1024 * 1024;
	db = openDatabase("todo", "", "", dbSize);
	
	//建立資料表
	db.transaction(function(tx) {
		tx.executeSql("create table if not exists mynotes(id integer PRIMARY KEY, title char(50), details text, last_date datetime)");
	});
	
	//綁定事件
	$("#btn_add").on("click", addNote);
	$("#btn_del").on("click", showDelBtn);
	$("#btn_saveNote").on("click", saveNote);

	//顯示列表
	showAllNotes();

	//若記事列表很長，往下捲超過一定範圍時會出現浮動按鈕可回到最上方 ＋
	$("#gotop").click(function(){
		$("html,body").animate({scrollTop:0},1000);
	});

	$(window).scroll(function() {
		if($(this).scrollTop() > 300) {
			$("#gotop").fadeIn("fast");
		} else {
			$("#gotop").stop().fadeOut("fast"); //先將前面fadein的效果停止，然後執弄fadeout
        }
    });
    //若記事列表很長，往下捲超過一定範圍時會出現浮動按鈕可回到最上方 -

	function showAllNotes() {
		$("#event_list").empty();
		var notes = "";
		
		//query出所有的記事
		/*
		<li id="1">
			<a href="#">
				<h3>title</h3>
				<p>details</p>					
			</a>
		</li>
		*/
		db.transaction(function(tx) {
			tx.executeSql("select id, title, details, last_date from mynotes", [],
				function(tx, result) {
					if(result.rows.length > 0) {
						for(var i = 0; i < result.rows.length; i++) {
							var item = result.rows.item(i);
							notes += "<li id='" + item['id'] + "' data-icon='false'><a href='#'><h3>" + item['title'] + "</h3><p>" + item['details'] + "</p></a></li>";
						}
						$("#event_list").append(notes); //加進ul list裡
						//$("a.del_btn").hide();
						$("#event_list").listview("refresh"); //刷新頁面
					}
				},
				function(e) {
					alert("載入記事資料失敗: " + e.message);
				}
			);
		});
		
	}
		
	function addNote() {
		$.mobile.changePage("#addNote", {}); //叫出新增記事頁面
	}
	
	function showDelBtn() {
		//$("a.del_btn").show();
		if($(".class_del").length<=0) {
			//$("<button class='class_del_btn'>Delete</button>");
			//$("<a href='#' class='ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext class_del_btn'>delete</a>");
			var deleteButton = $("<input type='checkbox' name='del_checkbox' class='class_del' />");
			$("li:visible").before(deleteButton);

			/*
			$("#btn_add").remove();
			var okButton = $("<button>ok</button>");
			$("#id_header_home").append(okButton);
			*/
		}		
	}
	
	function deleteNote() {
		alert("you click del button!");
	}
	
	function saveNote() {
		var title_info = $("#noteTitle").val();
		var details_info = $("#noteDetails").val();

		//新增資料列
		db.transaction(function(tx) {	    
			tx.executeSql("insert into mynotes(title, details, last_date) values(?, ?, datetime('now', 'localtime'))", [title_info, details_info], 
				function(tx, result) {
					$("#addNote").dialog("close");
					$("#status").html("儲存成功!").show(0).delay(3000).hide(0); //顯示出“儲存成功”訊息三秒後消失

					showAllNotes();//顯示列表
					
				},
				function(e) {
					alert("新增資料失敗:" + e.message);
				}
			);
		});
	}
	
	


});
