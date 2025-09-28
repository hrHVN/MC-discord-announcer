import Query from 'mcquery';

export function MinecraftQuery(SERVER_URL, SERVER_PORT, cb, cb_err) {
	const client = new Query(SERVER_URL, SERVER_PORT, { timeout: 5000 });

	function shouldWeClose () {
	  // have we got all answers
	  if (client.outstandingRequests === 0) {
	    client.close()
	  }
	}

	client.connect()
	.then(() => {
		client.full_stat((err, stat) => {
			if (err) {
    			console.error(err);
  			}
	
  			cb(stat);
  			shouldWeClose();
		});
	})
	.catch(err => {
		console.error("[ERROR] MinecraftQuery - error connecting %s", SERVER_URL, err);
		cb_err(SERVER_URL);
	});
}
