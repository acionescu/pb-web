package net.segoia.pbweb.server;

import javax.servlet.ServletContext;
import javax.websocket.server.ServerEndpoint;

import net.segoia.eventbus.web.websocket.server.EventNodeEndpointConfigurator;
import net.segoia.eventbus.web.ws.v0.ServerWsEndpointV0;

@ServerEndpoint(value = "/ws/web/v0/events", configurator = EventNodeEndpointConfigurator.class)
public class PbWebServerWsEndpointV0 extends ServerWsEndpointV0 {

    @Override
    protected void initEventNode() {
	// TODO Auto-generated method stub
//	final FilteringEventBus systemBus = EBus.getSystemBus();

	setEventNode(PbWebAppNode.getInstance().getEventNode());

    }

    @Override
    protected void init() {
	// TODO Auto-generated method stub
	super.init();

	System.out.println("init node");
	ServletContext ogegContext = getHttpSession().getServletContext().getContext("/ogeg");
	System.out.println("ogeg context: " + ogegContext);
    }

    @Override
    public String getChannel() {
	return "WSS_WEB_V0";
    }

}
