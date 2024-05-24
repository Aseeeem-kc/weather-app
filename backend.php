<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$servername = "sql212.infinityfree.com";
$username = "if0_35986782";
$password = "jyknIlqljapX";
$database = "if0_35986782_weatherappdb";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
  echo json_encode(["error" => "Failed to connect to SQL database"]);
  exit();
}

// Set default city name
$defaultCityName = 'serampore';

// Get the city name from the query parameter
if (!isset($_GET['q'])) {
  $cityName = $defaultCityName; // Use default city if no query parameter is provided
} else {
  $cityName = $_GET['q']; // Use the provided query parameter as the city name
}

$url = "https://api.openweathermap.org/data/2.5/weather?q=" . $cityName . "&appid=c30f253bcae18f3b268b07da1063cc8a&units=metric";
$response = file_get_contents($url);
$data = json_decode($response, true); // converts json data to php object

if (!$data || isset($data['message'])) {
  echo json_encode(["error" => "Failed to fetch weather data for city: $cityName"]);
  exit();
}

$city = $data['name'];

// Get the timezone offset from the API response
$timezoneOffset = $data['timezone'];

// Calculate the local time of the city searched based on the timezone offset
$localTime = time() + $timezoneOffset;

// Convert local time to date format (without time)
$date = date('Y-m-d', $localTime);

$weather_condition = $data['weather'][0]['description'];
$weather_icons = $data['weather'][0]['icon'];
$temperature = $data['main']['temp'];
$pressure = $data['main']['pressure'];
$wind_speed = $data['wind']['speed'];
$humidity = $data['main']['humidity'];
$min_temp = $data['main']['temp_min'];
$max_temp = $data['main']['temp_max'];
$feels_like = $data['main']['feels_like'];
$country = $data['sys']['country'];

// Check if the city and date combination already exist in the database
$existingDataQuery = "SELECT * FROM weather WHERE city='$city' AND date='$date'";
$existingDataResult = mysqli_query($conn, $existingDataQuery);

if (mysqli_num_rows($existingDataResult) > 0) {
  // If the city and date combination exists, update the data
  $updateDataQuery = "UPDATE weather SET weather_condition='$weather_condition', weather_icons='$weather_icons', temperature='$temperature', pressure='$pressure', wind_speed='$wind_speed', humidity='$humidity', min_temp='$min_temp', max_temp='$max_temp', feels_like='$feels_like', time_zone='$timezoneOffset', country='$country' WHERE city='$city' AND date='$date'";
  if (!mysqli_query($conn, $updateDataQuery)) {
    echo json_encode(["error" => "Failed to update data: " . mysqli_error($conn)]);
    exit();
  }
} else {
  // If the city and date combination doesn't exist, insert new data
  $insertDataQuery = "INSERT INTO weather(city,date,weather_condition,weather_icons,temperature,pressure,wind_speed,humidity,min_temp,max_temp,feels_like,time_zone,country) VALUES('$city','$date','$weather_condition','$weather_icons','$temperature','$pressure','$wind_speed','$humidity',$min_temp,$max_temp,$feels_like,$timezoneOffset,'$country')";
  if (!mysqli_query($conn, $insertDataQuery)) {
    echo json_encode(["error" => "Failed to insert data: " . mysqli_error($conn)]);
    exit();
  }
}

// Fetch all data for the city for the past 7 days
$selectAllDataQuery = "SELECT * FROM weather WHERE city='$city' AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
$selectAllDataResult = mysqli_query($conn, $selectAllDataQuery);

if ($selectAllDataResult && mysqli_num_rows($selectAllDataResult) > 0) {
  $rows = array(); // Initialize an empty array to store rows

  // Fetch each row and append it to the $rows array
  while ($row = mysqli_fetch_assoc($selectAllDataResult)) {
    $rows[] = $row;
  }

  // Convert the array to JSON format
  echo json_encode($rows);
} else {
  echo json_encode(["error" => "No data found for city: $cityName in the past 7 days"]);
}

mysqli_close($conn);
