module.exports = function(RED) {
    function NodeWithConfig(config) {
        RED.nodes.createNode(this,config);

        this.server = RED.nodes.getNode(config.server);

        if (this.server) {
            // Do something with:
            //  this.server.host
            //  this.server.port
        
            console.log(this.server)
        } else {
            // No config node configured

            console.log("no configs for server")
        }	

	    this.server2 = RED.nodes.getNode(config.server2);

        if (this.server2) {
            // Do something with:
            //  this.server.host
            //  this.server.port
		
		    console.log(this.server2)
        } else {
            // No config node configured

		    console.log("no configs  for server2")
        }	
        
        var node = this;

        node.on('input',function(msg){
//			msg.payload = msg.payload.toLowerCase();
            msg.payload = msg.payload 
            msg.server = node.server
            msg.server2 = node.server2
            node.send(msg);
        });

    }
    RED.nodes.registerType("nodewithconfig",NodeWithConfig);
}

