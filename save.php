<?

	// массив, в который соберем данные запроса
	$requestData = array();

	// Белый список названий параметров
	$fieldNamesList = array('alias', 'types', 'fname', 'lname', 'company', 'phone', 'email', 'planned_visit_date', 'purchased_excursion_title', 'typePrice');
	
	// Заполнение массива $requestData	
	foreach($fieldNamesList as $fieldName){
		if( isset($_POST[$fieldName]) ){
			$requestData[$fieldName] = $_POST[$fieldName];
		}
	}
	
	// Пример добавления идентификатора заявки
	$requestData['extra'] = [
		'lead_id' => 1234567890
	];
	
	// Параметр связывания Google Analytics
	if( isset($_POST['_ga']) ){
		$requestData['_ga'] = $_POST['_ga'];	
	}
	
	// Источник для TicketForEvent
	if( isset($_POST['source']) ){
		$requestData['source'] = $_POST['source'];	
	}
	
	// сбор массива в searchString ( key=value&key2=value2 )
	$requestQueryString = http_build_query($requestData);

	// Итоговый адрес для редиректа
	$url = 'https://buy.ticketforevent.com/script/redirectForm.php?' . $requestQueryString;	

	header('Location: ' . $url);
	
?>