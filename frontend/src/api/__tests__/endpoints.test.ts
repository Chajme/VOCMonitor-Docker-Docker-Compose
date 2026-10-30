import { afterEach, describe, expect, it, vi } from "vitest";
import {
  deleteDevice,
  deleteNotification,
  getLatestReading,
  newDevice,
  selectDevice,
  updateSettings,
} from "../endpoints";

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

describe("form-encoded endpoints", () => {
  it("newDevice sends device_name and topic as a form body", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ message: "New device added!" }));

    await newDevice("esp", "data");

    const { url, init } = firstCall(fetchMock);
    expect(url).toBe("/new_device");
    expect(init.method).toBe("POST");

    const body = init.body as URLSearchParams;
    expect(body).toBeInstanceOf(URLSearchParams);
    expect(body.get("device_name")).toBe("esp");
    expect(body.get("topic")).toBe("data");
  });

  it("updateSettings forwards the provided form unchanged", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ message: "Settings updated successfully!" }));

    const form = new URLSearchParams({ advice_1: "ok", notifications_enabled: "true" });
    await updateSettings(form);

    const { url, init } = firstCall(fetchMock);
    expect(url).toBe("/update_settings");
    expect(init.body).toBe(form);
  });
});

describe("JSON endpoints", () => {
  it("deleteNotification sends the id", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ message: "Notification successfully deleted!" }));

    await deleteNotification(42);

    const { url, init } = firstCall(fetchMock);
    expect(url).toBe("/delete_notification");
    expect(init.body).toBe(JSON.stringify({ id: 42 }));
  });

  it("deleteDevice sends id, device_name and topic", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ message: "Device successfully deleted!" }));

    await deleteDevice(3, "esp", "data");

    const { init } = firstCall(fetchMock);
    expect(JSON.parse(init.body as string)).toEqual({
      id: 3,
      device_name: "esp",
      topic: "data",
    });
  });

  it("selectDevice sends the fields in the shape the backend reads", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ message: "New device selected!" }));

    await selectDevice(3, "esp", "data");

    const { init } = firstCall(fetchMock);
    expect(JSON.parse(init.body as string)).toEqual({
      id: 3,
      topic: "data",
      device_name: "esp",
    });
  });

  it("getLatestReading surfaces the backend's empty-data error as a result", async () => {
    const fetchMock = stubFetch();
    fetchMock.mockResolvedValue(jsonResponse({ message: "Error fetching new data" }, 500));

    const result = await getLatestReading();

    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
  });
});
