function createPopupWin(pageURL, pageTitle, width, height) {
	var leftPosition, topPosition;
	//Allow for borders.
	leftPosition = window.screen.width / 2 - (width / 2 );
	//Allow for title and status bars.
	topPosition = window.screen.height / 2 - (height / 2 + 50);
	window.open(
		pageURL,
		pageTitle,
		"resizable=yes, width=" +
			width +
			", height=" +
			height +
			", top=" +
			topPosition +
			", left=" +
			leftPosition
	);
}

// status  calling || answer

// calling call_id = none

let url =
	`http://localhost:9090/${user_token}/${user_id}/${status}/${call_id}`;
    createPopupWin(url, "Video Call", "990", "650");

    /**
     * calling:
     * user_id -> id thằng muốn gọi
     * status = "calling"
     * id = "none"
     */

    //  id: 608
    //  message: "Calling"
    //  message_time: "2022-06-26T15:51:58.457Z"
    //  message_type: "call"
    //  msg_time_total: 0
    //  user_recv_id: "3"
    //  user_sent_id: 1

    /** 
     * answer:
     * user_id -> user_sent_id
     * status = "answer"
     * call_id -> id
     * 
     * */
    `` 



