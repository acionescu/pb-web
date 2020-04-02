package net.segoia.pbweb.server;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import net.segoia.event.eventbus.CustomEventContext;
import net.segoia.event.eventbus.peers.CustomEventHandler;
import net.segoia.event.eventbus.peers.GlobalEventNodeAgent;
import net.segoia.event.eventbus.peers.events.NewPeerEvent;
import net.segoia.event.eventbus.peers.vo.bind.ConnectToPeerRequest;
import net.segoia.eventbus.web.ws.v0.WsClientEndpointTransceiver;
import net.segoia.util.logging.Logger;
import net.segoia.util.logging.MasterLogManager;

public class ParallelProxyClient extends GlobalEventNodeAgent {
    private static Logger logger = MasterLogManager.getLogger(ParallelProxyClient.class.getSimpleName());
    /* client to remote node */
    private WsClientEndpointTransceiver targetServerClient;

    private ProxiedServerNodeController serverNodeController;

    private Map<String, ProxiedClientNodeController> clientsControllers = new HashMap<>();

    private Map<String, CustomEventHandler<NewPeerEvent>> newPeerHandlersByType = new HashMap<>();

    /**
     * the types of client peer that we should proxy
     */
    private String[] acceptedClientTypes;

    public ParallelProxyClient(String uri, String... acceptedClientTypes) {
	this.acceptedClientTypes = acceptedClientTypes;
	try {
	    targetServerClient = new WsClientEndpointTransceiver(new URI(uri), "WSS_WEB_V0");
	} catch (URISyntaxException e) {
	    // TODO Auto-generated catch block
	    e.printStackTrace();
	}
    }

    @Override
    protected void agentInit() {
	context.registerToPeer(new ConnectToPeerRequest(targetServerClient));
    }

    @Override
    protected void registerHandlers() {
	context.addEventHandler(NewPeerEvent.class, (c) -> {
	    System.out.println("We a new peer " + c.getEvent().toJson());
	});

    }

    @Override
    protected void config() {
	newPeerHandlersByType.put(targetServerClient.getClass().getSimpleName(), (c) -> {
	    handleTargetServerConnection(c);
	});

	CustomEventHandler<NewPeerEvent> newClientHandler = (c) -> {
	    handleNewClientPeer(c);
	};

	for (String act : acceptedClientTypes) {

	    newPeerHandlersByType.put(act, newClientHandler);
	}

    }

    protected void handleTargetServerConnection(CustomEventContext<NewPeerEvent> c) {
	serverNodeController = new ProxiedServerNodeController();
    }

    protected void handleNewClientPeer(CustomEventContext<NewPeerEvent> c) {
	NewPeerEvent event = c.getEvent();
	String peerId = event.getData().getPeerId();
	if(clientsControllers.containsKey(peerId)) {
	    /* ups we already have a client with this id */
	    logger.error("Got new peer event, but peer id already existed: "+peerId);
	    return;
	}
	
	clientsControllers.put(peerId, new ProxiedClientNodeController());
	
    }

    @Override
    public void terminate() {
	targetServerClient.terminate();

    }
}
