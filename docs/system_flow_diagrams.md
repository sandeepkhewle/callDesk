# Complete System Flow Diagrams

## 🔄 Enhanced Security Architecture

### 1. Complete Call Flow (Click-to-Call)

````mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant P as Provider API

    Note over F: User initiates call
    F->>B: POST /click-to-call<br/>{agentId, calling_party_b, entityId}
    
    Note over B: ONLY customer number from frontend
    
    B->>DB: Find Agent by agentId
    DB-->>B: {phone, deskphone, entity}
    
    Note over B: Validate Agent
    B->>B: Check agent.phone exists
    B->>B: Check agent.deskphone exists
    B->>B: Verify agent.entity === entityId
    
    B->>DB: Get API Key for entityId
    DB-->>B: Return decrypted API key
    
    Note over B: Create Call Log
    B->>DB: INSERT CallLog<br/>(status: INITIATED)
    
    Note over B: Make Call (all params from DB)
    B->>P: click_to_call_v2<br/>calling_party_a = agent.phone<br/>calling_party_b = customer<br/>deskphone = agent.deskphone
    
    P-->>B: {success, call_id}
    
    B->>DB: UPDATE CallLog<br/>(call_id, status: RINGING)
    
    B-->>F: {success, call_id}
    
    Note over P: Later, call status changes
    P->>B: POST /webhooks/call<br/>{call_id, status: COMPLETED}
    
    B->>DB: Find CallLog by call_id
    B->>DB: UPDATE status = COMPLETED
    
    B-->>P: {processed: true}
````

---

### 2. Data Source Matrix

````mermaid
graph LR
    subgraph "Frontend Input (Minimal)"
        FI1[agentId]
        FI2[calling_party_b]
        FI3[entityId]
    end
    
    subgraph "Backend Fetch (Secure)"
        BF1[agent.phone]
        BF2[agent.deskphone]
        BF3[API Key]
    end
    
    subgraph "Provider API Call"
        PC[calling_party_a<br/>calling_party_b<br/>deskphone<br/>authcode]
    end
    
    FI1 --> BF1
    FI1 --> BF2
    FI2 --> PC
    FI3 --> BF3
    
    BF1 --> PC
    BF2 --> PC
    BF3 --> PC
    
    style FI1 fill:#90EE90
    style FI2 fill:#90EE90
    style FI3 fill:#90EE90
    style BF1 fill:#FFB6C1
    style BF2 fill:#FFB6C1
    style BF3 fill:#FFB6C1
````

---

### 3. Entity → IVR → Agent → Call Relationship

````mermaid
erDiagram
    ENTITY ||--o{ IVR : owns
    ENTITY ||--o{ AGENT : has
    ENTITY ||--o{ CALL_LOG : tracks
    AGENT ||--o{ CALL_LOG : initiates
    AGENT }o--|| IVR : "uses (deskphone)"
    
    ENTITY {
        ObjectId _id
        string name
= string status
        string companyId
    }
    
    IVR {
        string number PK
        ObjectId entity FK
        string status
        string providerLabel
    }
    
    AGENT {
        ObjectId _id PK
        ObjectId entity FK
        string agent_id
        string user_id
        string phone
        string deskphone FK
        int access
        int active
    }
    
    CALL_LOG {
        ObjectId _id PK
        ObjectId entity FK
        ObjectId agent FK
        string callId
        string customerNumber
        string ivrNumber
        string status
        int duration
    }
````

---

### 4. Security Comparison Diagram

````mermaid
graph TB
    subgraph "❌ OLD (VULNERABLE)"
        O1[Frontend] -->|deskphone<br/>calling_party_a<br/>calling_party_b| O2[Backend]
        O2 --> O3[Provider]
        
        style O1 fill:#ff6b6b
        style O2 fill:#ff6b6b
    end
    
    subgraph "✅ NEW (SECURE)"
        N1[Frontend] -->|agentId<br/>calling_party_b<br/>entityId| N2[Backend]
        N2 --> N3[(Database)]
        N3 -->|agent.phone<br/>agent.deskphone<br/>API key| N2
        N2 --> N4[Provider]
        
        style N1 fill:#51cf66
        style N2 fill:#51cf66
        style N3 fill:#51cf66
        style N4 fill:#51cf66
    end
````

---

### 5. Complete Lifecycle Flow

````mermaid
graph TD
    A[1. Create Entity] --> B{Status: PENDING}
    B --> C[2. Admin: Create API Key]
    C --> D[3. Admin: Sync IVRs]
    
    D --> E[(IVRs stored locally)]
    
    E --> F[4. Create Agent]
    F --> G{Assign phone + deskphone}
    
    G --> H[Agent Ready]
    
    H --> I[5. Frontend: Click-to-Call]
    I --> J{Send: agentId, calling_party_b}
    
    J --> K[6. Backend Lookup]
    K --> L[Fetch: agent.phone,<br/>agent.deskphone,<br/>API key]
    
    L --> M[7. Create CallLog<br/>status: INITIATED]
    M --> N[8. Call Provider API]
    
    N --> O{Call Status}
    O -->|Ringing| P[Update: RINGING]
    O -->|Answered| Q[Update: ANSWERED]
    O -->|Completed| R[Update: COMPLETED + duration]
    
    R --> S[✅ Call Complete]
    
    style A fill:#e7f5ff
    style E fill:#fff3bf
    style H fill:#d3f9d8
    style M fill:#ffe3e3
    style S fill:#b2f2bb
````

---

## 📊 API Evolution Table

| Parameter | Old API | New API | Source |
|-----------|---------|---------|--------|
| `entityId` | ✅ Required | ✅ Required | Frontend |
| `agentId` | ❌ Missing | ✅ Required | Frontend |
| `calling_party_a` | ✅ Frontend | ❌ Removed | Backend: `agent.phone` |
| `calling_party_b` | ✅ Frontend | ✅ Frontend | User Input (Customer) |
| `deskphone` | ✅ Frontend | ❌ Removed | Backend: `agent.deskphone` |

---

## 🔐 Security Principle

> **Zero Trust from Frontend**
> 
> The frontend can ONLY provide:
> - Which agent is making the call (`agentId`)
> - Who to call (`calling_party_b`)
> - Which entity context (`entityId`)
> 
> The backend controls ALL sensitive data:
> - Agent's phone number
> - IVR/deskphone number  
> - API credentials
