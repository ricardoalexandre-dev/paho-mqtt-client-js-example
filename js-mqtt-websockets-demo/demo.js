// Create a client instance
var client = null;
var connected = false;

// Called after form input is processed
function startConnect() {
    // Fetch the clientId from the form
    var clientId = document.getElementById("clientId").value;

    // Fetch the input data from the web page form
    var hostname = document.getElementById("host").value;   // This is my Broker IP
    var port = Number(document.getElementById("port").value); // This is my Broker Port
    //var user = document.getElementById("username").value;
    //var pass = document.getElementById("password").value;
    var keepAlive = Number(document.getElementById("keepAlive").value);
    var timeout = Number(document.getElementById("timeout").value);
    var tls = document.getElementById("tls").checked;
    var cleanSession = document.getElementById("cleanSession").checked;
    //var automaticReconnect = document.getElementById("automaticReconnect").checked;
    //var lastWillTopic = document.getElementById("lwtTopic").value;
    //var lastWillQos = Number(document.getElementById("lwtQos").value);
    //var lastWillRetain = document.getElementById("lwtRetain").checked;
    //var lastWillMessageVal = document.getElementById("lwtMessage").value;

    // Initialize new Paho client connection
    client = new Paho.MQTT.Client(hostname, port, clientId);

    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    client.onConnected = onConnected;

    // see client class docs for all the options
    var options = {
        invocationContext: { host: hostname, port: port, clientId: clientId },
        timeout: timeout,
        keepAliveInterval: keepAlive,
        cleanSession: cleanSession,
        useSSL: tls,
        //reconnect: automaticReconnect,
        onSuccess: onConnected,
        onFailure: onFailure
    };

    // Connect the client, if successful, call onConnected function
    client.connect(options);

    connectionString = options.invocationContext.host + ":" + options.invocationContext.port

    // Print output for the user in the messages div
    document.getElementById("messages").innerHTML += '<span>Connecting to "' + connectionString + '" as hostname:port' + '</span><br/>';
    document.getElementById("messages").innerHTML += '<span>Using the following clientID: ' + options.invocationContext.clientId + '...'+ '</span><br/>';
}

// Called when the client connects successfully
function onConnected(context) {
    console.log("onConnected: Connected successfully on " + context.connectionString);
    document.getElementById("messages").innerHTML += '<span>Connection: Connected. </span><br/>';
    updateScroll(); // Scroll to bottom of window

    subscribe(); // Call the subscribe method 
}

// Called if client can't connects
function onFailure(responseObject) {
    console.log("onFailure: " + responseObject.errorMessage);
    document.getElementById("messages").innerHTML += '<span>Failure:' + responseObject.errorMessage + '</span><br/>';
    updateScroll(); // Scroll to bottom of window
}


// Called when the client subscribe a Topic
function subscribe() {
    // Fetch the MQTT topic from the form
    var topic = document.getElementById("topic").value;
    // Fetch the MQTT QoS from the form
    var qos = Number(document.getElementById("qos").value);

    var options = {
        onSuccess: subscribeSuccess,
        onFailure: subscribeFailure,
        invocationContext: { topic: topic, qos: qos }
    };

    console.log("Subscribing to Topic: " + options.invocationContext.topic + " with QoS: " + options.invocationContext.qos);
    document.getElementById("messages").innerHTML += '<span>Subscribing to: "' + options.invocationContext.topic + '" with QoS: ' + + options.invocationContext.qos + '... </span><br/>';
    updateScroll(); // Scroll to bottom of window

    // Subscribe to the requested topic
    client.subscribe(topic, options);
}

// Called when the client subscribes a topic successfully
function subscribeSuccess(context) {
    console.log("Subscribed. [Topic: ", context.invocationContext.topic, "]");
    document.getElementById("messages").innerHTML += '<span>Subscribed. [Topic: '+ context.invocationContext.topic+ '] </span><br/>';
    updateScroll(); // Scroll to bottom of window
}

// Called when the client can't subscribes a topic 
function subscribeFailure(context) {
    console.log("Failed to subscribe. [Topic: ", context.invocationContext.topic, "]");
    document.getElementById("messages").innerHTML += '<span>Failed to subscribe. [Topic: ' + context.invocationContext.topic + '] </span><br/>';
    updateScroll(); // Scroll to bottom of window
}

// Called when the client unsubscribe a Topic
function unsubscribe() {
    // Fetch the MQTT topic from the form
    var topic = document.getElementById("topic").value;
    // Fetch the MQTT QoS from the form
    var qos = Number(document.getElementById("qos").value);

    var options = {
        onSuccess: unsubscribeSuccess,
        onFailure: unsubscribeFailure,
        invocationContext: { topic: topic, qos: qos }
    };

    console.log("Unsubscribing topic: " + options.invocationContext.topic + " with QoS: " + options.invocationContext.qos);
    document.getElementById("messages").innerHTML += '<span>Unsubscribing topic: "' + options.invocationContext.topic + '" with QoS: ' + + options.invocationContext.qos + '...</span><br/>';
    updateScroll(); // Scroll to bottom of window

    // Unsubscribe to the requested topic
    client.unsubscribe(topic, options);
}

// Called when the client unsubscribes a topic successfully
function unsubscribeSuccess(context) {
    console.log("Unsubscribed. [Topic: ", context.invocationContext.topic, "]");
    document.getElementById("messages").innerHTML += '<span>Unsubscribed. [Topic: ' + context.invocationContext.topic + '] </span><br/>';

    clearInterval(stream);

    updateScroll(); // Scroll to bottom of window
}

// Called when the client can't unsubscribes a topic 
function unsubscribeFailure(context) {
    console.log("Failed to unsubscribe. [Topic: ", context.invocationContext.topic, "]");
    document.getElementById("messages").innerHTML += '<span>Failed to subscribe. [Topic: ' + context.invocationContext.topic + '] </span><br/>';
    updateScroll(); // Scroll to bottom of window
}


// Called when the client loses its connection
function onConnectionLost(responseObject) {
    console.log("onConnectionLost: Connection Lost.");
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost: " + responseObject.errorMessage);
    }
}

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>';
    updateScroll(); // Scroll to bottom of window
}

function publishStream() {
    automaticStream = document.getElementById("automaticStream").checked;
    if (automaticStream) {
        stream = setInterval(this.publishMessage, 1000);
    }
}

//Creates a new Messaging.Message Object and sends it to the HiveMQ MQTT Broker
function publishMessage() {
    // Fetch the MQTT topic from the form
    topic = document.getElementById("topic").value;

    // Fetch the MQTT publish message from the form
    payload = document.getElementById("msgToPublish").value;

    // Fetch the MQTT publish message QoS from the form
    msgQos = Number(document.getElementById("msgQos").value);

    // Fetch the MQTT publish message Retain from the form
    msgRetain = document.getElementById("msgRetain").checked;

    //Send your message (also possible to serialize it as JSON or protobuf or just use a string, no limitations)
    var message = new Paho.MQTT.Message(payload);
    message.destinationName = topic;
    message.qos = msgQos;
    message.retained = msgRetain;
    client.send(message);
    console.log("onPublishMessage: " + message.payloadString);

}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Connection: Disconnected.</span><br/>';
    updateScroll(); // Scroll to bottom of window
}

// Updates #messages div to auto-scroll
function updateScroll() {
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
}

// Clear #messages div
function clearHistory() {
    var table = document.getElementById("messages");
    table.innerHTML = "";
}