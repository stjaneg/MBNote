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
			//$("#gotop").stop().fadeOut("fast"); //先將前面fadein的效果停止，然後執弄fadeout -->失敗了，先mark掉
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
		//if($(".class_del").length <=0 ) { //若刪除用的checkbox已出現過，就不再出現
		// + 按鈕變成 x 按鈕
		if($("li:visible").length > 0) {
			$("#btn_add").attr("data-icon", "delete").addClass("ui-icon-" + "delete").removeClass("ui-icon-" + "plus");
			$("#btn_add").off("click"); //解除click事件綁定的所有方法
			$("#btn_add").on("click", deleteNote);

			// - 按鈕變成 <- 按鈕
			$("#btn_del").attr("data-icon", "back").addClass("ui-icon-" + "back").removeClass("ui-icon-" + "minus");
			$("#btn_del").off("click");
			$("#btn_del").on("click", revertShowDelBtn);

			//出現chekcbox
			var deleteButton = $("<input type='checkbox' name='del_checkbox' class='class_del' />");
			$("li:visible").before(deleteButton);
		} else {
			alert("您目前沒有任何記事項目，可點擊右上角的按鈕 ＋ 新增記事！");
		}
		//}
	}

	function revertShowDelBtn() {
		//復原 ＋ 按鈕
		$("#btn_add").attr("data-icon", "plus").addClass("ui-icon-" + "plus").removeClass("ui-icon-" + "delete");
		$("#btn_add").off("click");
		$("#btn_add").on("click", addNote);

		//復原 - 按鈕
		$("#btn_del").attr("data-icon", "minus").addClass("ui-icon-" + "minus").removeClass("ui-icon-" + "back");
		$("#btn_del").off("click");
		$("#btn_del").on("click", showDelBtn);

		//刪掉checkbox
		$(".class_del").remove();
	}

	function deleteNote() {
		var checknumber = $("input[name='del_checkbox']:checked").length; //或者這樣寫  $(".class_del:checked").length;

		if (checknumber<=0) {
			alert("請勾選欲刪除項目!");
		} else {
			//alert("被選數：" + checknumber);

			if (confirm("您確定要刪除這" + checknumber +"個項目? （刪除後無法復原）")) {  //若user按下確定，confirm會回傳true；取消則回傳false
				$("input[name='del_checkbox']:checked").each(function(i) {
					var deleteId = $(this).next("li").attr("id");

					//alert(deleteId);

					db.transaction(function(tx) {
						tx.executeSql("delete from mynotes where id=?", [deleteId],
							function(tx, result) {
							},
							function(e) {
								alert("第" + i + "個項目刪除失敗: " + e.message);
							}
						);
					});
				});

				revertShowDelBtn();
				showAllNotes();//顯示列表
			}
		}
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
