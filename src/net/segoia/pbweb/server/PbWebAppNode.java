package net.segoia.pbweb.server;

import net.segoia.event.eventbus.agents.GlobalAgentRegisterRequest;
import net.segoia.event.eventbus.peers.EventNode;
import net.segoia.event.eventbus.util.EBus;

public class PbWebAppNode {
    private static PbWebAppNode instance;

    private EventNode eventNode;

    private PbWebAppNode() {
	eventNode = EBus.getMainNode();
	
	eventNode.registerGlobalAgent(new GlobalAgentRegisterRequest(new ParallelProxyClient("ws://localhost:8180/ogeg/ws/web/v0/events",PbWebServerWsEndpointV0.class.getSimpleName())));

    }

    public static PbWebAppNode getInstance() {
	if (instance == null) {
	    instance = new PbWebAppNode();
	}
	return instance;
    }

    public EventNode getEventNode() {
	return eventNode;
    }
}
