import { afterEach, describe, expect, it, vi } from "vitest";
import { apiGet, apiPostForm, apiPostJson } from "../client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubFetch() {
  const fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function firstCall(fetchMock: ReturnType<typeof stubFetch>): {
  url: RequestInfo | URL;
  init: RequestInit;
} {
  const call = fetchMock.mock.calls[0];
  if (!call) throw new Error("fetch was not called");
  return { url: call[0], init: call[1] ?? {} };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("apiGet", () => {
  it("returns ok data for a 200 JSON response", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ selected_device: "esp" }));

    const result = await apiGet<{ selected_device: string }>("/current_device");

    expect(fetchMock).toHaveBeenCalledWith("/current_device", { method: "GET" });
    expect(result).toEqual({
      ok: true,
      status: 200,
      data: { selected_device: "esp" },
    });
  });

  it("returns an expected 404 as a failure result instead of throwing", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ message: "No data available" }, 404));

    const result = await apiGet<unknown>("/data");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ message: "No data available" });
  });

  it("returns a 500 as a failure result (the backend uses this when there is no row)", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Error fetching new data: 'NoneType' object is not subscriptable" }, 500),
    );

    const result = await apiGet<unknown>("/data");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
  });

  it("treats an empty body as null", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(new Response("", { status: 200 }));

    const result = await apiGet<unknown>("/empty");

    expect(result).toEqual({ ok: true, status: 200, data: null });
  });

  it("rejects on a network failure", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(apiGet("/data")).rejects.toThrow("network down");
  });

  it("rejects on malformed JSON", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(new Response("not json", { status: 200 }));

    await expect(apiGet("/data")).rejects.toThrow();
  });
});

describe("apiPostJson", () => {
  it("sends a JSON body with the JSON content type", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ message: "ok" }));

    const result = await apiPostJson("/delete_notification", { id: 7 });

    const { url, init } = firstCall(fetchMock);
    expect(url).toBe("/delete_notification");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(init.body).toBe(JSON.stringify({ id: 7 }));
    expect(result).toEqual({ ok: true, status: 200, data: { message: "ok" } });
  });
});

describe("apiPostForm", () => {
  it("sends a form body without setting a content type", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ message: "ok" }));

    const form = new URLSearchParams({ device_name: "esp", topic: "data" });
    await apiPostForm("/new_device", form);

    const { url, init } = firstCall(fetchMock);
    expect(url).toBe("/new_device");
    expect(init.method).toBe("POST");
    expect(init.headers).toBeUndefined();
    expect(init.body).toBe(form);
  });
});
