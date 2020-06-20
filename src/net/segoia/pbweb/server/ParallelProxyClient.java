package net.segoia.pbweb.server;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;

import net.segoia.event.conditions.Condition;
import net.segoia.event.conditions.OrCondition;
import net.segoia.event.conditions.StrictSourceAliasMatchCondition;
import net.segoia.event.conditions.StrictSourceTypeMatchCondition;
import net.segoia.event.eventbus.CustomEventContext;
import net.segoia.event.eventbus.Event;
import net.segoia.event.eventbus.EventHeader;
import net.segoia.event.eventbus.FilteringEventBus;
import net.segoia.event.eventbus.peers.CustomEventHandler;
import net.segoia.event.eventbus.peers.GlobalEventNodeAgent;
import net.segoia.event.eventbus.peers.events.PeerAcceptedEvent;
import net.segoia.event.eventbus.peers.events.PeerLeftEvent;
import net.segoia.event.eventbus.peers.vo.bind.ConnectToPeerRequest;
import net.segoia.eventbus.web.ws.v0.WsClientEndpointTransceiver;
import net.segoia.util.logging.Logger;
import net.segoia.util.logging.MasterLogManager;

public class ParallelProxyClient extends GlobalEventNodeAgent {
    private static Logger logger = MasterLogManager.getLogger(ParallelProxyClient.class.getSimpleName());

    private String serverAlias;

    /* client to remote node */
    private WsClientEndpointTransceiver targetServerClient;

    private ProxiedServerNodeController serverNodeController;

    private String serverPeerId;

    private Map<String, ProxiedClientNodeController> clientsControllers = new HashMap<>();
    
    private Map<String, PeerAcceptedEvent> proxiedClients = new HashMap<>();

    private Map<String, CustomEventHandler<PeerAcceptedEvent>> newPeerHandlersByType = new HashMap<>();

    /**
     * the types of client peer that we should proxy
     */
    private String[] acceptedClientTypes;

    private Deque<Event> pendingClientEvents = new ArrayDeque<>(1000);

    public ParallelProxyClient(String uri, String... acceptedClientTypes) {
	this.acceptedClientTypes = acceptedClientTypes;
	this.serverAlias = uri;
	try {
	    targetServerClient = new WsClientEndpointTransceiver(new URI(uri), "WSS_WEB_V0");
	} catch (URISyntaxException e) {
	    // TODO Auto-generated catch block
	    e.printStackTrace();
	}
    }

    @Override
    protected void agentInit() {
	connectToServer();
    }

    protected void connectToServer() {
	context.registerToPeer(new ConnectToPeerRequest(targetServerClient));
    }

    @Override
    protected void registerHandlers() {
	FilteringEventBus serverBus = context.getEventBusForCondition(new StrictSourceAliasMatchCondition(serverAlias));

	Condition[] clientTypesCond = new Condition[acceptedClientTypes.length];
	int i = 0;
	for (String act : acceptedClientTypes) {
	    clientTypesCond[i++] = new StrictSourceTypeMatchCondition(act);
	}

	FilteringEventBus clientsBus = context.getEventBusForCondition(new OrCondition(clientTypesCond));

//	/* new server connection */
//	serverBus.addEventHandler(NewPeerEvent.class, (c) -> {
//	    handleTargetServerConnection(c);
//	});
//	
//	clientsBus.addEventHandler(NewPeerEvent.class, (c) -> {
//	    handleNewClientPeer(c);
//	});

	context.addEventHandler(PeerAcceptedEvent.class, (c) -> {
	    PeerAcceptedEvent event = c.getEvent();
	    String sourceType = event.getHeader().getSourceType();
	    logger.info("new peer " + sourceType + " " + event.getData().getPeerId());
	    CustomEventHandler<PeerAcceptedEvent> h = newPeerHandlersByType.get(sourceType);
	    if (h != null) {
		h.handleEvent(c);
	    }
	});

	context.addEventHandler(PeerLeftEvent.class, (c) -> {
	    handlePeerLeft(c);
	});

	clientsBus.addEventHandler((c) -> {
	    handleClientEvent(c.getEvent());
	});

    }

    protected void handlePeerLeft(CustomEventContext<PeerLeftEvent> c) {
	String peerId = c.getEvent().getData().getPeerId();

	if (serverPeerId != null && serverPeerId.equals(peerId)) {
	    handleServerLeft(c);
	}
	else{
	    handleClientLeft(c);
	}
    }
    
    protected void handleClientLeft(CustomEventContext<PeerLeftEvent> c) {
	String peerId = c.getEvent().getData().getPeerId();
	/* remove this from proxied clients */
	PeerAcceptedEvent peerAcceptEvent = proxiedClients.remove(peerId);
	
	if(peerAcceptEvent != null) {
	    /* terminate this peer */
	    context.terminatePeer(peerId);
	}
    }

    protected void handleServerLeft(CustomEventContext<PeerLeftEvent> c) {
	logger.info("connection with server " + serverPeerId + " lost. Reconnecting...");
	/* make server unavailable */
	serverPeerId = null;
	
	/* disconnect all proxied peers */
	
	/* reconnect */
	connectToServer();
    }

    @Override
    protected void config() {
	newPeerHandlersByType.put(targetServerClient.getClass().getSimpleName(), (c) -> {
	    handleTargetServerConnection(c);
	});

	CustomEventHandler<PeerAcceptedEvent> newClientHandler = (c) -> {
	    handleNewClientPeer(c);
	};

	for (String act : acceptedClientTypes) {

	    newPeerHandlersByType.put(act, newClientHandler);
	}

    }

    protected void handleTargetServerConnection(CustomEventContext<PeerAcceptedEvent> c) {

	serverNodeController = new ProxiedServerNodeController();
	serverPeerId = c.getEvent().getData().getPeerId();
	logger.info("Server is connected as " + serverPeerId);
	processPendingEvents();
    }

    protected void handleNewClientPeer(CustomEventContext<PeerAcceptedEvent> c) {
	PeerAcceptedEvent event = c.getEvent();

	/* set origin cause */
	EventHeader header = event.getHeader();
	header.setOriginRootCause(header.getRootEvent());
	
	/* add this to proxied peers */
	proxiedClients.put(event.getData().getPeerId(), event);

//	String peerId = event.getData().getPeerId();
//	if (clientsControllers.containsKey(peerId)) {
//	    /* ups we already have a client with this id */
//	    logger.error("Got new peer event, but peer id already existed: " + peerId);
//	    return;
//	}

//	clientsControllers.put(peerId, new ProxiedClientNodeController());

//	handleClientEvent(new Event("GOT:REMOTE:PEER"));

//	handleClientEvent(event);
    }

    private void processPendingEvents() {
	while (!pendingClientEvents.isEmpty()) {
	    sendToServer(pendingClientEvents.poll());
	}
    }

    private void sendToServer(Event event) {
	if (logger.isDebugEnabled()) {
	    logger.debug("sending event to server " + event.toJson());
	}
	context.forwardTo(event, serverPeerId);
    }

    private void handleClientEvent(Event e) {
	if (serverPeerId != null) {
	    sendToServer(e);
	} else {
	    pendingClientEvents.offer(e);
	}
    }

    @Override
    public void terminate() {
	targetServerClient.terminate();

    }
}
