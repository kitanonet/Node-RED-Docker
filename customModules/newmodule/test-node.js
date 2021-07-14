module.exports = function(RED) {

	function TestNodeFnct(config){
		RED.nodes.createNode(this,config);

		var node = this;

        node.typedInputJSON=config.typedInputJSON
        node.select=config.select

		node.on('input',function(msg){
            console.log(node.typedInputJSON)
            console.log(node.select)
//			msg.payload = msg.payload.toLowerCase();
			msg.payload = msg.payload + " what we want to do"
			node.send(msg);
		});
	}
	
	RED.nodes.registerType("test-node",TestNodeFnct)
}