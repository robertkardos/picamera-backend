app.controller('testCotroller', function ($http) {
	console.log('testCotroller');
	$http.get(
		'http://localhost:3000/video',
		{
			responseType: 'arraybuffer'
		}).then(function (response) {
			console.log(response);
		});
});
