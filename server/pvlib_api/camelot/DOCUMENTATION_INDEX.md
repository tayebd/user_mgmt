# Documentation Index

## Overview

This directory contains comprehensive documentation for the PV Panel Datasheet Extraction utility. The documentation is organized to serve different audiences and purposes.

## Documentation Map

### For All Users
Start here if you're new to the project or need to use the utility.

| Document | Purpose | Audience |
|----------|---------|----------|
| **[README.md](README.md)** | Main documentation, quick start, usage examples | All users |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Problem diagnosis and resolution | All users experiencing issues |

### For Developers
These documents provide technical details for understanding and extending the system.

| Document | Purpose | Audience |
|----------|---------|----------|
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System design, data flow, patterns | Architects, senior developers |
| **[API_REFERENCE.md](API_REFERENCE.md)** | Complete API documentation | Developers integrating or modifying |
| **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** | Extension guide, best practices | Developers contributing to codebase |
| **[EXTRACTION_IMPROVEMENTS.md](EXTRACTION_IMPROVEMENTS.md)** | Technical improvements summary | Technical stakeholders |

### For Maintenance
These documents support project maintenance and evolution.

| Document | Purpose | Audience |
|----------|---------|----------|
| **[CHANGELOG.md](CHANGELOG.md)** | Version history and changes | Maintainers, users tracking updates |
| **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** | This file - navigation guide | All documentation readers |

## Quick Navigation

### I want to...
- **Use the utility** → Read [README.md](README.md)
- **Process datasheets** → See "Quick Start" in [README.md](README.md#quick-start)
- **Add new manufacturer** → Follow [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#adding-support-for-new-manufacturer)
- **Understand the code** → Study [ARCHITECTURE.md](ARCHITECTURE.md)
- **Troubleshoot issues** → Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Extend functionality** → Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
- **Learn the API** → Browse [API_REFERENCE.md](API_REFERENCE.md)
- **See what's new** → Review [CHANGELOG.md](CHANGELOG.md)

## Documentation Statistics

- **Total Pages**: 8 comprehensive documents
- **Total Words**: ~35,000 words
- **Code Examples**: 50+ examples across all documents
- **Diagrams**: Architecture diagrams in ARCHITECTURE.md
- **Tables**: 20+ reference tables across documents

## Document Hierarchy

```
PV Panel Datasheet Extraction Documentation
│
├── README.md (Entry Point)
│   ├── Quick Start
│   ├── Usage Examples
│   ├── Configuration
│   └── Supported Formats
│
├── TROUBLESHOOTING.md
│   ├── Common Issues
│   ├── Diagnosis Steps
│   └── Solutions
│
├── ARCHITECTURE.md
│   ├── System Overview
│   ├── Layer Descriptions
│   ├── Data Flow
│   └── Design Patterns
│
├── API_REFERENCE.md
│   ├── Core Classes
│   ├── Methods
│   ├── Data Models
│   └── CLI Interface
│
├── DEVELOPER_GUIDE.md
│   ├── Development Setup
│   ├── Adding Manufacturers
│   ├── Code Style
│   └── Best Practices
│
├── EXTRACTION_IMPROVEMENTS.md
│   ├── Improvements Made
│   ├── Test Results
│   └── Technical Implementation
│
├── CHANGELOG.md
│   ├── Version History
│   ├── Added Features
│   ├── Bug Fixes
│   └── Known Limitations
│
└── DOCUMENTATION_INDEX.md (This File)
    ├── Navigation Guide
    └── Quick Links
```

## Key Concepts Covered

### Technical Concepts
- **Transposed Table Parsing**: Electrical specifications with power classes in column headers
- **Alternating Row Format**: Parameter names in one row, values in the next
- **Table Deduplication**: Removing duplicate extractions
- **Confidence Scoring**: Tracking extraction reliability
- **Batch Processing**: Multi-file processing workflows

### Supported Manufacturers
- **Q CELLS**: Q.PEAK DUO L-G5.2 series
- **Hyperion**: HY-DH108P8B series
- **Extensible**: Framework supports adding new manufacturers

### Output Formats
- **JSON**: Structured data with metadata
- **CSV**: Tabular format for analysis
- **Summary**: Processing statistics

## Reading Paths

### New User Path
1. Start with [README.md](README.md) - Quick Start section
2. Try the examples in README.md
3. If issues arise, check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Developer Path
1. Read [ARCHITECTURE.md](ARCHITECTURE.md) for system understanding
2. Review [API_REFERENCE.md](API_REFERENCE.md) for implementation details
3. Follow [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for extending the system
4. Study code examples throughout documents

### Maintainer Path
1. Review [CHANGELOG.md](CHANGELOG.md) for version history
2. Check [EXTRACTION_IMPROVEMENTS.md](EXTRACTION_IMPROVEMENTS.md) for technical details
3. Reference [API_REFERENCE.md](API_REFERENCE.md) for API contracts

## Document Relationships

```
README.md
  ├── References TROUBLESHOOTING.md
  ├── References API_REFERENCE.md
  └── References DEVELOPER_GUIDE.md

ARCHITECTURE.md
  ├── References API_REFERENCE.md
  └── References DEVELOPER_GUIDE.md

DEVELOPER_GUIDE.md
  ├── References API_REFERENCE.md
  └── References TROUBLESHOOTING.md

TROUBLESHOOTING.md
  └── References API_REFERENCE.md

EXTRACTION_IMPROVEMENTS.md
  └── References multiple documents

CHANGELOG.md
  └── References README.md
```

## Maintenance Schedule

### Regular Updates
- **CHANGELOG.md**: Update with each release
- **README.md**: Update when features change
- **API_REFERENCE.md**: Update when API changes

### Periodic Reviews
- **ARCHITECTURE.md**: Review quarterly for accuracy
- **DEVELOPER_GUIDE.md**: Update when best practices evolve
- **TROUBLESHOOTING.md**: Add new issues and solutions as discovered

### Version Alignment
- All documentation versions should match software version
- CHANGELOG.md tracks version correlations
- Document last updated dates shown in footer

## Contributing to Documentation

### Standards
- Use clear, concise language
- Include code examples for complex concepts
- Add diagrams for architectural concepts
- Provide context for all recommendations

### Tools Used
- Markdown formatting
- Code syntax highlighting
- Table formatting for reference data
- Emojis sparingly for visual appeal

### Review Process
1. Draft changes in feature branch
2. Technical review by senior developer
3. Editorial review for clarity
4. Update CHANGELOG.md
5. Merge to main branch

## Additional Resources

### External Documentation
- [Camelot Documentation](https://camelot-py.readthedocs.io/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)

### Internal Resources
- Source code with inline comments
- Test files with examples
- Log output with detailed information

## Feedback

To improve documentation:
1. Note unclear sections while reading
2. Identify missing information
3. Suggest improvements via issue tracker
4. Contribute updates following developer guide

---

## Navigation Tips

### Find Information Fast
- Use browser search (Ctrl+F / Cmd+F) to find specific terms
- Check table of contents at top of each document
- Refer to index tables for quick parameter lookup
- Use cross-references between documents

### Print-Friendly
- All documents designed for PDF export
- Code examples formatted for print
- Tables use monospace fonts when exported
- Diagrams maintain readability

### Mobile Viewing
- Responsive design for mobile devices
- Code blocks scroll horizontally if needed
- Table of contents navigation works on touch devices

---

**Maintained By**: PV System Development Team
**Last Updated**: 2025-11-03
**Documentation Version**: 1.0.0
