package net.segoia.pbweb.server;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/dr")
public class DynamicGatewayServlet extends HttpServlet {
    /**
     * 
     */
    private static final long serialVersionUID = -52939799276669950L;
    public static final String ACTION_PARAM = "a";
    public static final String REQUEST_CHANNEL_PARAM = "c";

    public static final String TARGET_ENTITY_HASH = "teh";

    private Map<String, DynamicRequestRouter> requestRoutersByAction = new HashMap<>();

    private String BASE_URL = "https://panouldebord.ro/";

    @Override
    public void init() throws ServletException {
	super.init();

	requestRoutersByAction.put("OpenEntity", (c) -> {
	    HttpServletRequest req = c.getReq();
	    String teh = req.getParameter(TARGET_ENTITY_HASH);

	    if (teh == null || teh.isEmpty()) {
		try {
		    c.getResp().sendError(HttpServletResponse.SC_BAD_REQUEST);
		} catch (IOException e) {
		    // TODO Auto-generated catch block
		    e.printStackTrace();
		}
		return;
	    }
	    String redirectUrl = getDefaultBaseUrl(req) + "#s=detalii&teh=" + teh;

	    try {
		c.getResp().sendRedirect(redirectUrl);
	    } catch (IOException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	    }
	});
    }

    public static String getBaseUrl(HttpServletRequest request) {
	String scheme = request.getScheme() + "://";
	String serverName = request.getServerName();
	String serverPort = (request.getServerPort() == 80) ? "" : ":" + request.getServerPort();
	String contextPath = request.getContextPath();
	return scheme + serverName + serverPort + contextPath + "/";
    }

    public static String getBaseUrl2(HttpServletRequest request) {
	StringBuffer requestURL = request.getRequestURL();
	String servletPath = request.getServletPath();
	int end = requestURL.indexOf(servletPath);

	return requestURL.substring(0, end) + "/";
    }

    private String getDefaultBaseUrl(HttpServletRequest request) {
	if (BASE_URL != null) {
	    return BASE_URL;
	}
	return getBaseUrl2(request);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

	String action = req.getParameter(ACTION_PARAM);

	if (action == null) {
	    resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
	    return;
	}

	DynamicRequestRouter router = requestRoutersByAction.get(action);
	if (router != null) {
	    router.route(new DynamicRequestContext(req, resp));
	    return;
	}

	resp.sendError(HttpServletResponse.SC_BAD_REQUEST);
	return;
    }

}
