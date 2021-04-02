package net.segoia.pbweb.server;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DynamicRequestContext {
    private HttpServletRequest req;
    private HttpServletResponse resp;

    public DynamicRequestContext(HttpServletRequest req, HttpServletResponse resp) {
	super();
	this.req = req;
	this.resp = resp;
    }

    public HttpServletRequest getReq() {
	return req;
    }

    public void setReq(HttpServletRequest req) {
	this.req = req;
    }

    public HttpServletResponse getResp() {
	return resp;
    }

    public void setResp(HttpServletResponse resp) {
	this.resp = resp;
    }

}
