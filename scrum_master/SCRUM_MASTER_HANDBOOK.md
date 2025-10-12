# Scrum Master Handbook - Australia 2026 Places App

## Role & Responsibilities

As Scrum Master, I am solely responsible for delivering a production-ready "places" app by orchestrating 4 specialized AI agents through sequential phases.

### Core Responsibilities
1. **Agent Deployment**: Deploy specialized agents for each phase
2. **Quality Assurance**: Evaluate all deliverables against acceptance criteria
3. **Decision Making**: Approve, request improvements, or reject agent work
4. **Risk Management**: Identify and mitigate blockers
5. **Progress Tracking**: Maintain detailed sprint logs and status reports
6. **Production Readiness**: Ensure final product meets all quality gates

## Project Overview

**Project Name**: Australia 2026 Shared Album
**Project Type**: Collaborative photo-sharing web application
**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, Firebase
**Target**: Production deployment with 4 friends as users
**Timeline**: 4 Phases, 30-42 hours total development

## Phase Architecture

| Phase | Agent Role | Duration | Complexity | Status |
|-------|-----------|----------|------------|---------|
| 1 | Infrastructure Setup Specialist | 4-6h | Low | PENDING |
| 2 | Feature Development Specialist | 8-10h | Medium | PENDING |
| 3 | Advanced Features Specialist | 8-12h | Medium-High | PENDING |
| 4 | Security & DevOps Specialist | 10-14h | High | PENDING |

## CRITICAL: UI Component Standards (Enforced 2025-10-12)

**ALL AGENTS MUST FOLLOW THESE RULES**:

1. **NO Browser Native UI**: Never use `alert()`, `confirm()`, `prompt()` - Use custom Modal/ConfirmModal/Toast
2. **NO Inline SVGs**: Always use lucide-react icons - Import from `lucide-react`
3. **NO Hardcoded Strings**: All text through i18n system - Use `useTranslations()`
4. **Consistent Components**: Use components from `/components/ui/` - Modal, Toast, Dropdown
5. **Next.js Images**: Always include `sizes` prop when using `fill` attribute
6. **Documentation Location**: All docs in `/docs/` folder, NOT root directory

**Read Before Starting**: `/docs/UI_COMPONENT_SYSTEM.md`

---

## Evaluation Framework

### Acceptance Gates (All Must Pass)

#### Phase 1 Gates
- [ ] Development server runs without errors
- [ ] TypeScript compiles with zero errors
- [ ] Firebase services connected and functional
- [ ] User can sign in with Google OAuth
- [ ] User can sign out
- [ ] Navigation works on mobile and desktop
- [ ] No console errors

#### Phase 2 Gates
- [ ] Photos upload successfully to Firebase Storage
- [ ] Firestore documents created with correct schema
- [ ] Albums CRUD operations functional
- [ ] Tags parse and save correctly
- [ ] Visibility filtering works for all three levels
- [ ] Gallery displays with proper responsive grid
- [ ] All forms validate required fields

#### Phase 3 Gates
- [ ] Map renders with geotagged photos
- [ ] Comments save and display in real-time
- [ ] Reactions toggle and count correctly
- [ ] Timeline groups photos by date
- [ ] All Firestore listeners properly unsubscribe
- [ ] No SSR errors with Leaflet
- [ ] Mobile UX tested and responsive

#### Phase 4 Gates
- [ ] Dynamic role system working without hardcoded values
- [ ] Admin dashboard accessible only to admin role
- [ ] Firestore security rules deployed and enforced
- [ ] Storage security rules deployed and enforced
- [ ] Cloud Function auto-assigns roles
- [ ] First user receives admin role automatically
- [ ] All security scenarios tested and passed

### Quality Metrics

**Code Quality**
- TypeScript strict mode: 100% compliance
- No `any` types except where necessary
- Proper error handling on all async operations
- Consistent naming conventions

**Performance**
- Development server start: <5s
- Photo upload (5MB): <10s
- Gallery load (100 photos): <3s
- Map render (50 markers): <3s

**Security**
- No hardcoded credentials in codebase
- All sensitive operations protected server-side
- HTTPS only in production
- Firebase rules enforce all access control

**User Experience**
- Mobile-first responsive design
- Loading states on all async operations
- Error messages user-friendly
- Forms validate before submission

## Agent Management Protocol

### Agent Deployment Process

1. **Pre-Deployment Checklist**
   - Previous phase completed and approved
   - Agent brief prepared
   - Success criteria defined
   - Evaluation rubric ready

2. **Deployment**
   - Use Task tool with appropriate subagent_type
   - Provide complete context from agent prompt document
   - Set clear deliverables and acceptance criteria

3. **Monitoring**
   - Track agent progress
   - Identify blockers early
   - Request clarifications if needed

4. **Evaluation**
   - Test all acceptance criteria
   - Run security checks
   - Verify code quality
   - Document findings

5. **Decision**
   - **APPROVE**: Move to next phase
   - **REQUEST IMPROVEMENTS**: Provide specific feedback
   - **REJECT**: Deploy new agent with corrected brief

### Agent Communication

**To Agent:**
- Clear, specific requirements
- Complete context
- Defined success metrics
- Expected deliverables list

**From Agent:**
- Completion report
- Files created/modified
- Testing results
- Known issues and recommendations

### Mandatory Agent Resources

**ALL agents MUST use these resources when unsure:**

1. **Web Search**: Use WebSearch tool for:
   - Latest Next.js 15 documentation and best practices
   - Current Firebase SDK versions and APIs
   - TypeScript patterns and solutions
   - Package compatibility issues
   - Error message troubleshooting

2. **MCP Context7**: Use mcp__context7 tools for:
   - Official library documentation (Next.js, React, Firebase, etc.)
   - API references and examples
   - Best practices from official sources
   - Code snippets and patterns

**Search Protocol**:
- ALWAYS search before guessing
- Use official documentation over blog posts
- Verify compatibility with Next.js 15 and React 18
- Cross-reference multiple sources for critical decisions

## Risk Management

### Known Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Firebase quota exceeded | Low | High | Monitor usage, implement limits |
| TypeScript errors blocking | Medium | Medium | Strict validation at each phase |
| Security rules misconfiguration | Medium | High | Test with multiple accounts |
| Agent misunderstanding requirements | Medium | Medium | Detailed prompts, iterative feedback |
| Phase dependencies broken | Low | High | Validate handoff criteria strictly |

## Documentation Structure

```
scrum_master/
├── SCRUM_MASTER_HANDBOOK.md       # This file
├── briefs/                        # Agent deployment briefs
│   ├── phase_1_brief.md
│   ├── phase_2_brief.md
│   ├── phase_3_brief.md
│   └── phase_4_brief.md
├── evaluations/                   # Agent work evaluations
│   ├── phase_1_evaluation.md
│   ├── phase_2_evaluation.md
│   ├── phase_3_evaluation.md
│   └── phase_4_evaluation.md
├── reports/                       # Sprint reports and status
│   ├── sprint_log.md
│   └── production_readiness.md
└── tracking/                      # Progress tracking
    └── phase_status.md
```

## Decision Authority

As Scrum Master, I have final authority on:
- ✅ Agent deployment timing
- ✅ Work acceptance or rejection
- ✅ Quality standards
- ✅ Production readiness certification
- ✅ Phase progression

## Success Definition

**MVP Success Criteria:**
1. All 4 phases completed successfully
2. All acceptance gates passed
3. Production deployment functional
4. Security audit passed
5. User acceptance testing completed
6. No critical bugs or security issues
7. Documentation complete and accurate

---

**Scrum Master**: Claude Code Agent
**Project Start**: 2025-10-12
**Target Completion**: TBD based on agent execution
**Status**: Phase 0 - Infrastructure Setup
