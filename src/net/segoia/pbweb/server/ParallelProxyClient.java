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
import net.segoia.event.eventbus.FilteringEventBus;
import net.segoia.event.eventbus.peers.CustomEventHandler;
import net.segoia.event.eventbus.peers.GlobalEventNodeAgent;
import net.segoia.event.eventbus.peers.events.PeerAcceptedEvent;
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
	    String sourceType = c.getEvent().getHeader().getSourceType();
	    System.out.println("new peer " + sourceType);
	    CustomEventHandler<PeerAcceptedEvent> h = newPeerHandlersByType.get(sourceType);
	    if (h != null) {
		h.handleEvent(c);
	    }
	});

	clientsBus.addEventHandler((c) -> {
	    handleClientEvent(c.getEvent());
	});
	
	

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
	System.out.println("Server is connected " + serverPeerId);
	processPendingEvents();
    }

    protected void handleNewClientPeer(CustomEventContext<PeerAcceptedEvent> c) {
	PeerAcceptedEvent event = c.getEvent();
	String peerId = event.getData().getPeerId();
	if (clientsControllers.containsKey(peerId)) {
	    /* ups we already have a client with this id */
	    logger.error("Got new peer event, but peer id already existed: " + peerId);
	    return;
	}

	clientsControllers.put(peerId, new ProxiedClientNodeController());

//	handleClientEvent(new Event("GOT:REMOTE:PEER"));

//	handleClientEvent(event);
    }

    private void processPendingEvents() {
	while (!pendingClientEvents.isEmpty()) {
	    sendToServer(pendingClientEvents.poll());
	}
    }

    private void sendToServer(Event event) {
	System.out.println("sending event to server " + event.toJson());
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
