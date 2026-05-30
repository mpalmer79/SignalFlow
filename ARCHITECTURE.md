# Architecture

# SignalFlow

AI-Powered Revenue Operating System

Version: 1.0

---

# 1. Product Thesis

SignalFlow is an AI-powered revenue operating system for businesses that depend on lead capture, fast follow-up, appointment setting, customer retention, and repeat revenue.

Traditional CRMs store customer data. SignalFlow acts on customer signals.

The platform captures customer events, scores intent, determines the next best action, and orchestrates follow-up across voice, SMS, email, and human handoff.

SignalFlow is designed for high-value service businesses where missed follow-up directly creates lost revenue.

Initial target verticals:

- Automotive retail
- Dental practices
- Medical offices
- Home services
- Legal intake
- Insurance agencies
- Real estate teams
- Local service businesses

---

# 2. Core Positioning

SignalFlow is not positioned as another CRM dashboard.

It is positioned as:

> An AI Revenue OS that turns customer signals into timely, compliant, revenue-producing actions.

The platform focuses on:

- Lead speed-to-response
- Missed opportunity recovery
- Appointment setting
- Follow-up automation
- Lead resurrection
- Multi-channel orchestration
- Customer intelligence
- Attribution
- Revenue accountability

---

# 3. Architectural Principles

## Action Over Storage

The system is built around customer actions, not static records.

A contact record is only useful if it helps determine:

- What happened
- What the customer wants
- What should happen next
- Who or what should take action
- Whether revenue moved forward

## Event-Driven by Default

Every important customer interaction becomes an event.

Examples:

- Lead submitted
- Call missed
- Appointment booked
- Appointment canceled
- Quote requested
- Website visited
- Email opened
- SMS replied
- Voice call completed
- Deal closed
- Customer went inactive

Events feed the customer intelligence graph, action graph, and orchestration engine.

## Consent-Aware Automation

SignalFlow must never treat communication consent as an afterthought.

The platform must track:

- Channel consent
- Consent source
- Consent timestamp
- Opt-out status
- Business purpose
- Vertical policy requirements
- Compliance-sensitive data restrictions

No outbound automation should execute without a consent and policy check.

## AI-Assisted, Rule-Governed

AI can classify, summarize, recommend, personalize, and converse.

AI does not own final policy enforcement.

Deterministic rules control:

- Consent checks
- Channel eligibility
- Quiet hours
- Escalation rules
- Risk flags
- Communication limits
- Compliance boundaries

## Human Handoff First

The system should automate routine follow-up but escalate important moments to humans.

Examples:

- High-value opportunity
- Angry customer
- Compliance-sensitive message
- Medical question
- Legal question
- Financing concern
- Purchase-ready buyer
- Appointment rescue opportunity

## Vertical Packs Over Generic CRM Logic

Each vertical has different data, compliance risk, workflow timing, and revenue triggers.

SignalFlow should support reusable vertical packs instead of hard-coding one industry.

Examples:

- Automotive Pack
- Dental Pack
- Medical Pack
- Home Services Pack
- Legal Intake Pack

---

# 4. High-Level System Model

```text
Customer Signals
      |
      v
Event Ingestion Layer
      |
      v
Customer Intelligence Graph
      |
      v
Intent and Priority Scoring
      |
      v
Action Graph
      |
      v
Consent and Policy Engine
      |
      v
Follow-Up Orchestrator
      |
      v
Voice / SMS / Email / Human Handoff
      |
      v
Outcome Tracking and Attribution
```

---

# 5. Core Domains

## 5.1 Customer Domain

The Customer Domain owns identity, relationships, and customer-level context.

Responsibilities:

- Customer profile
- Contact methods
- Identity resolution
- Household or company relationships
- Communication preferences
- Consent status
- Timeline history

Core entities:

```text
Customer
ContactMethod
CustomerIdentity
CustomerRelationship
ConsentRecord
CustomerTimelineEvent
```

---

## 5.2 Signal Domain

The Signal Domain captures events that indicate customer intent or revenue opportunity.

Responsibilities:

- Lead events
- Website activity
- Communication events
- Appointment events
- Deal events
- Missed call events
- Inactivity events
- Campaign engagement events

Core entities:

```text
Signal
SignalType
SignalSource
SignalPayload
SignalPriority
SignalStatus
```

Example signal types:

```text
NEW_LEAD
MISSED_CALL
SMS_REPLY
EMAIL_OPENED
APPOINTMENT_REQUESTED
APPOINTMENT_CANCELED
QUOTE_REQUESTED
TRADE_IN_SUBMITTED
SERVICE_DUE
RECALL_OPPORTUNITY
PATIENT_REACTIVATION
ESTIMATE_REQUESTED
```

---

## 5.3 Customer Intelligence Graph

The Customer Intelligence Graph connects customers, signals, preferences, history, intent, and revenue outcomes.

It answers questions such as:

- Who is this customer?
- What have they done recently?
- What are they likely trying to accomplish?
- What channel do they respond to?
- What is the next best action?
- What revenue opportunity exists?
- What risk or compliance limits apply?

Graph relationships:

```text
Customer -> submitted -> Lead
Customer -> owns -> Vehicle
Customer -> requested -> Appointment
Customer -> responded_to -> Campaign
Customer -> missed -> Call
Customer -> prefers -> Channel
Customer -> associated_with -> Opportunity
Customer -> converted_into -> RevenueOutcome
```

The graph does not need to start as a graph database.

MVP implementation can use relational tables with graph-like access patterns.

---

## 5.4 Opportunity Domain

The Opportunity Domain represents possible revenue moments.

Examples:

- Vehicle purchase inquiry
- Service appointment
- Dental cleaning reactivation
- Medical consultation request
- HVAC estimate
- Legal intake
- Insurance quote
- Missed appointment recovery

Core entities:

```text
Opportunity
OpportunityStage
OpportunityValueEstimate
OpportunitySource
OpportunityOwner
OpportunityOutcome
```

Suggested stages:

```text
New
Contact Attempted
Engaged
Appointment Set
Needs Human Review
Won
Lost
Dormant
Reactivated
```

---

## 5.5 Action Graph

The Action Graph determines what should happen next.

It combines:

- Customer state
- Signal type
- Opportunity value
- Consent
- Channel availability
- Timing
- Vertical rules
- AI recommendations
- Business goals

Example action graph:

```text
New Lead Received
      |
      v
Check Consent
      |
      v
Score Intent
      |
      v
Choose Channel
      |
      v
Generate Message
      |
      v
Send or Queue
      |
      v
Wait for Response
      |
      v
Escalate / Continue / Close
```

Action types:

```text
SEND_SMS
SEND_EMAIL
PLACE_VOICE_CALL
CREATE_TASK
ASSIGN_HUMAN_OWNER
BOOK_APPOINTMENT
REQUEST_REVIEW
PAUSE_AUTOMATION
MARK_LOST
REACTIVATE_LEAD
```

---

## 5.6 Consent and Policy Engine

The Consent and Policy Engine is a required safety boundary.

Responsibilities:

- Validate communication eligibility
- Enforce opt-outs
- Enforce channel restrictions
- Enforce quiet hours
- Enforce vertical-specific rules
- Prevent unsafe automation
- Record policy decisions

Policy checks must happen before any outbound communication.

Core entities:

```text
ConsentRecord
PolicyRule
PolicyDecision
SuppressionRecord
CommunicationLimit
```

Policy decision example:

```text
Action Requested: SEND_SMS
Customer: 123
Channel: SMS
Consent: Present
Opt-Out: False
Quiet Hours: False
Vertical Policy: Passed
Decision: Allowed
```

Blocked decision example:

```text
Action Requested: PLACE_VOICE_CALL
Customer: 456
Channel: Voice
Consent: Missing
Decision: Blocked
Reason: No voice consent on record
```

---

# 6. AI Architecture

SignalFlow should use AI as an intelligence and interaction layer, not as the source of truth.

## 6.1 AI Responsibilities

AI may be used for:

- Lead classification
- Intent detection
- Conversation summarization
- Next-best-action recommendation
- Message drafting
- Voice conversation handling
- Sentiment analysis
- Objection detection
- Call summary generation
- Campaign audience suggestions
- Customer reactivation suggestions

## 6.2 AI Non-Responsibilities

AI must not be solely responsible for:

- Consent enforcement
- Compliance decisions
- Final medical guidance
- Final legal guidance
- Financial approval decisions
- Opt-out handling
- Identity authority
- Billing authority
- Final deployment of campaigns

## 6.3 Model Provider Abstraction

SignalFlow should support multiple model providers behind a provider abstraction.

Potential providers:

- OpenAI
- Anthropic Claude
- Google Gemini
- Microsoft Copilot ecosystem where applicable

Provider abstraction should support:

```text
generateText()
classifyIntent()
summarizeConversation()
scoreOpportunity()
draftMessage()
extractStructuredData()
```

The product should avoid tight coupling to one AI provider.

---

# 7. Voice AI Layer

The Voice AI Layer enables outbound and inbound voice workflows.

Initial use cases:

- Missed call follow-up
- Appointment confirmation
- Appointment rescheduling
- Lead qualification
- Service reminder
- Dental reactivation
- Estimate request follow-up
- No-show recovery

Potential provider architecture:

```text
SignalFlow Orchestrator
      |
      v
Voice Session Manager
      |
      v
Speech / Realtime Model Provider
      |
      v
Voice Synthesis Provider
      |
      v
Telephony Provider
      |
      v
Call Transcript and Outcome
```

Possible integrations:

- OpenAI Realtime or voice-capable model layer for conversation intelligence
- ElevenLabs for high-quality voice generation
- Twilio or similar telephony provider for call transport
- Internal policy engine for call eligibility
- Internal audit log for call recording metadata, transcript, and outcome

Voice call lifecycle:

```text
Call Requested
      |
      v
Policy Check
      |
      v
Call Script Selected
      |
      v
Voice Session Created
      |
      v
Conversation Executed
      |
      v
Transcript Captured
      |
      v
Outcome Classified
      |
      v
Next Action Created
```

Voice call outcomes:

```text
Appointment Booked
Callback Requested
Not Interested
Wrong Number
Needs Human Follow-Up
Compliance Risk Detected
No Answer
Voicemail Left
```

MVP should simulate voice workflows before enabling real outbound calling.

---

# 8. Multi-Channel Communication Layer

SignalFlow should support communication across multiple channels.

Channels:

- SMS
- Email
- Voice
- Web chat
- Human task
- Internal notification

Each communication should be tracked as a first-class record.

Core entities:

```text
Communication
CommunicationChannel
CommunicationTemplate
CommunicationStatus
CommunicationOutcome
```

Statuses:

```text
Drafted
Queued
Sent
Delivered
Opened
Clicked
Replied
Failed
Blocked
Escalated
```

Every outbound communication must reference:

- Customer
- Opportunity
- Consent decision
- Template or generated content
- Sender
- Channel
- Timestamp
- Outcome

---

# 9. Follow-Up Orchestrator

The Follow-Up Orchestrator is the core execution engine.

It determines:

- When follow-up should happen
- Which channel should be used
- What message should be sent
- Whether AI should personalize content
- Whether a human should intervene
- When to stop automation

Workflow example:

```text
Lead Created
      |
      v
Immediate SMS
      |
      v
Wait 10 Minutes
      |
      v
If No Reply, Send Email
      |
      v
Wait 2 Hours
      |
      v
If High Value, Create Human Task
      |
      v
If Still No Response, Queue Voice Call
```

The orchestrator should support:

- Scheduled actions
- Conditional branches
- Retry limits
- Human approval gates
- Suppression rules
- Outcome-based routing
- Audit logging

---

# 10. Marketing Intelligence Layer

The Marketing Intelligence Layer helps businesses identify, segment, and activate customer audiences.

Capabilities:

- Lead source analysis
- Campaign attribution
- Audience segmentation
- Reactivation lists
- Lost opportunity mining
- Channel performance comparison
- Revenue outcome analysis

Example audiences:

```text
Customers who submitted a lead but never booked
Customers with missed calls in the last 7 days
Customers who opened email but did not reply
Patients overdue for cleaning
Service customers due for maintenance
Leads marked lost but still showing engagement
```

Marketing actions:

```text
Create Campaign
Suggest Audience
Draft Campaign Message
Approve Campaign
Launch Campaign
Track Outcomes
```

---

# 11. Vertical Packs

Vertical packs provide industry-specific workflows, fields, signals, templates, and policy rules.

## 11.1 Automotive Pack

Key objects:

```text
Vehicle
TradeIn
InventoryVehicle
ServiceAppointment
SalesLead
Deal
EquityOpportunity
RecallOpportunity
```

Signals:

```text
VIN Submitted
Trade Appraisal Requested
Payment Calculator Used
Inventory Vehicle Viewed
Service Due
Lease Ending
Missed Sales Call
Appointment No-Show
```

Actions:

```text
Send Vehicle Follow-Up
Book Test Drive
Request Trade Photos
Escalate Hot Buyer
Send Service Reminder
Reactivate Lost Lead
```

---

## 11.2 Dental Pack

Key objects:

```text
Patient
Appointment
TreatmentPlan
RecallReminder
InsuranceStatus
```

Signals:

```text
Cleaning Overdue
Appointment Canceled
Treatment Plan Not Scheduled
New Patient Inquiry
Missed Call
No-Show
```

Actions:

```text
Send Recall Reminder
Confirm Appointment
Reschedule No-Show
Route Billing Question
Escalate Treatment Plan Lead
```

---

## 11.3 Medical Pack

Key objects:

```text
Patient
Appointment
Referral
CareTeamTask
IntakeRequest
```

Signals:

```text
Appointment Request
Referral Received
Missed Call
Appointment Canceled
Form Incomplete
```

Actions:

```text
Confirm Appointment
Request Intake Form
Route Clinical Question
Create Staff Task
Pause Automation
```

Medical workflows require stricter policy boundaries.

AI should not provide diagnosis, treatment advice, or clinical decision-making.

---

## 11.4 Home Services Pack

Key objects:

```text
Property
Estimate
Job
TechnicianVisit
ServicePlan
```

Signals:

```text
Estimate Requested
Missed Call
Quote Viewed
Seasonal Service Due
Job Completed
Warranty Ending
```

Actions:

```text
Schedule Estimate
Follow Up On Quote
Send Maintenance Reminder
Request Review
Escalate High-Value Job
```

---

# 12. Data Architecture

MVP should use PostgreSQL with Prisma.

The system should model events explicitly instead of burying history in notes fields.

Recommended core tables:

```text
users
organizations
customers
contact_methods
consent_records
signals
opportunities
actions
communications
workflows
workflow_runs
policy_rules
policy_decisions
ai_outputs
audit_events
vertical_configs
```

Important design rule:

Every generated recommendation, communication, and workflow decision should be traceable back to the signal that caused it.

---

# 13. Audit Architecture

SignalFlow must provide explainability for every important action.

Audit events should track:

- Who initiated the action
- What signal triggered it
- What policy decision allowed or blocked it
- What AI output was generated
- What communication was sent
- What outcome occurred
- What changed in the customer record

Audit event examples:

```text
SIGNAL_RECEIVED
OPPORTUNITY_CREATED
INTENT_CLASSIFIED
POLICY_ALLOWED_ACTION
POLICY_BLOCKED_ACTION
MESSAGE_DRAFTED
MESSAGE_SENT
VOICE_CALL_QUEUED
VOICE_CALL_COMPLETED
HUMAN_TASK_CREATED
CUSTOMER_OPTED_OUT
OPPORTUNITY_WON
OPPORTUNITY_LOST
```

---

# 14. Security Architecture

Security requirements:

- Server-side authorization
- Organization-level data isolation
- Role-based access control
- Secure environment variables
- No secrets in the client
- No secrets in logs
- Strict audit logging
- Least privilege access
- Protected API routes

Suggested roles:

```text
Owner
Admin
Manager
SalesUser
ServiceUser
MarketingUser
ComplianceReviewer
Viewer
```

---

# 15. Compliance Architecture

SignalFlow must be designed with compliance boundaries from the start.

Important compliance areas:

- TCPA-style consent for calls and SMS
- CAN-SPAM-style email requirements
- Opt-out tracking
- Quiet-hour enforcement
- Healthcare privacy boundaries
- Internal access control
- Data retention controls
- Communication auditability

Compliance-sensitive rules:

```text
Do not contact opted-out customers
Do not call outside allowed hours
Do not send medical advice through AI
Do not expose unnecessary patient information
Do not continue automation after a stop request
Do not hide AI-generated communication history
```

---

# 16. MVP Scope

The MVP should prove the core architecture without attempting to build a full enterprise CRM.

## MVP Goals

- Show customer signal ingestion
- Show customer intelligence timeline
- Show AI-assisted intent scoring
- Show action graph decisions
- Show consent-aware follow-up routing
- Show simulated voice follow-up
- Show SMS and email workflow simulation
- Show opportunity progression
- Show audit trail
- Show vertical pack switching

## MVP Vertical Focus

Start with Automotive Pack.

Reason:

- Strong personal domain advantage
- Clear lead follow-up problem
- High revenue per opportunity
- Easy to explain to recruiters
- Strong demo value

Secondary demo packs:

- Dental
- Home Services

## MVP Non-Goals

The MVP should not include:

- Live outbound calls
- Real SMS blasting
- Real medical workflows
- Full Salesforce replacement
- Full marketing automation suite
- Real payment processing
- Complex enterprise permissions
- Multi-tenant billing

---

# 17. Recommended MVP Demo Flow

The public demo should show the following story:

```text
1. A new automotive lead enters SignalFlow.
2. SignalFlow creates a customer profile.
3. The customer intelligence graph connects lead source, vehicle interest, trade intent, and urgency.
4. The AI layer classifies the lead as high intent.
5. The action graph recommends immediate SMS, email backup, and human task creation.
6. The consent engine approves SMS and email but blocks voice until proper consent exists.
7. The orchestrator sends simulated follow-up.
8. The customer replies.
9. SignalFlow updates the opportunity stage.
10. A manager sees attribution, audit trail, and revenue impact.
```

This demo proves that SignalFlow is more than a dashboard.

It proves that the system can reason over signals, enforce policy, and move opportunities forward.

---

# 18. Future Architecture

Future capabilities:

## Real-Time Voice Agent

- Live outbound call execution
- Live inbound call handling
- Call transfer to staff
- Voice objection handling
- Call summarization
- Appointment booking

## Revenue Graph

- Lifetime value modeling
- Lead source ROI
- Revenue attribution
- Campaign performance
- Missed opportunity cost

## Advanced AI Agent Layer

- Specialized sales agent
- Service retention agent
- Appointment recovery agent
- Marketing strategist agent
- Compliance review agent

## Integration Marketplace

- Dealer management systems
- Practice management systems
- Calendars
- Email providers
- Telephony providers
- Website forms
- Ad platforms

## Predictive Revenue Engine

- Churn prediction
- Lead close probability
- Best-time-to-contact prediction
- Offer recommendation
- Reactivation scoring

---

# 19. Technical Stack Recommendation

Recommended MVP stack:

```text
Frontend: Next.js App Router
Language: TypeScript
Styling: Tailwind CSS
Components: shadcn/ui
Database: PostgreSQL
ORM: Prisma
Auth: Clerk
Hosting: Vercel or Railway
Email Simulation: Internal mock provider first
SMS Simulation: Internal mock provider first
Voice Simulation: Internal mock provider first
AI Layer: Provider abstraction with mocked responses first
```

Future integrations:

```text
OpenAI
Anthropic Claude
Google Gemini
ElevenLabs
Twilio
SendGrid
Google Calendar
CRM import APIs
DMS or practice management APIs
```

---

# 20. Engineering Standards

SignalFlow should be built as a serious portfolio-grade system.

Standards:

- Type-safe domain models
- Server-side validation
- Clear service boundaries
- No business logic in UI components
- Deterministic policy checks
- Explicit audit records
- Mock providers before paid integrations
- No hard-coded secrets
- No hidden AI behavior
- Clear README and architecture documentation
- Realistic demo data
- Vertical-specific examples

---

# 21. Success Criteria

SignalFlow succeeds as a portfolio project if a reviewer can understand the following within five minutes:

- What problem it solves
- Why generic CRMs fail at this problem
- How signals become actions
- How AI improves follow-up
- How consent and policy are enforced
- How the system expands across verticals
- How revenue impact is measured
- Why the architecture is stronger than a chatbot wrapper

SignalFlow should stand out as an AI-native revenue system, not another CRM clone.
