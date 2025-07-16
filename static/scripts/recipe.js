async function createSessionWorkflow(workflowCtx, portal) {
  let sessionId = null;
  let xCorrelator = null;

  return {
    "Step 1": {
      name: "Introduction",
      stepCallback: async (stepState) => {
        return workflowCtx.showContent(`## Session Management Workflow

This workflow demonstrates managing sessions through three key API operations:

- **Create a Session** → generates \`sessionId\` and \`x-correlator\`
- **View Session Details** → retrieves session information using the stored identifiers
- **Delete Session** → deletes the previously created session

Click **Next** to begin!
        `);
      },
    },

    "Step 2": {
      name: "Create Session",
      stepCallback: async (stepState) => {
        await portal.setConfig((defaultConfig) => {
          return {
            ...defaultConfig,
          };
        });

        return workflowCtx.showEndpoint({
          description: "Create a new session. This endpoint returns a `sessionId` and an `x-correlator` used for subsequent operations.",
          endpointPermalink: "$e/QoS%20Sessions/createSession",
          args: {
            body: {
              "user": "demoUser",
              "timeout": 300
            }
          },
          transform: (response) => {
            // Example expected response:
            // {
            //   "sessionId": "abc123",
            //   "x-correlator": "xyz-456"
            // }
            sessionId = response.sessionId;
            xCorrelator = response["x-correlator"];
            localStorage.setItem("sessionId", sessionId);
            localStorage.setItem("x-correlator", xCorrelator);
          },
          verify: (response, setError) => {
            if (response.sessionId && response["x-correlator"]) {
              return true;
            } else {
              setError("Failed to create session. Please try again.");
              return false;
            }
          },
        });
      },
    },

    "Step 3": {
      name: "View Session",
      stepCallback: async (stepState) => {
        await portal.setConfig((defaultConfig) => {
          return {
            ...defaultConfig,
          };
        });

        // Load from memory or localStorage fallback
        sessionId = sessionId || localStorage.getItem("sessionId");
        xCorrelator = xCorrelator || localStorage.getItem("x-correlator");

        return workflowCtx.showEndpoint({
          description: "Retrieve details of an existing session using `sessionId` and `x-correlator`.",
          endpointPermalink: "$e/QoS%20Sessions/getSession",
          args: {
            params: {
              sessionId: sessionId,
            },
            headers: {
              "x-correlator": xCorrelator,
            },
          },
          verify: (response, setError) => {
            if (response.sessionId === sessionId) {
              return true;
            } else {
              setError("Unable to retrieve session details.");
              return false;
            }
          },
        });
      },
    },

    "Step 4": {
      name: "Delete Session",
      stepCallback: async (stepState) => {
        await portal.setConfig((defaultConfig) => {
          return {
            ...defaultConfig,
          };
        });

        // Load from memory or localStorage fallback
        sessionId = sessionId || localStorage.getItem("sessionId");
        xCorrelator = xCorrelator || localStorage.getItem("x-correlator");

        return workflowCtx.showEndpoint({
          description: "Delete an existing session using `sessionId` and `x-correlator`.",
          endpointPermalink: "$e/QoS%20Sessions/deleteSession",
          args: {
            params: {
              sessionId: sessionId,
            },
            headers: {
              "x-correlator": xCorrelator,
            },
          },
          verify: (response, setError) => {
            if (response.status === "Deleted" || response.success === true) {
              return true;
            } else {
              setError("Failed to delete the session.");
              return false;
            }
          },
        });
      },
    },
  };
}
