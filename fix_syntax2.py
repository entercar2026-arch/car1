import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    text = f.read()

# Fix handleOpenAdd (line 529)
text = text.replace("      setIsFormOpen(true);\n    }\n  };\n\n  // Open edit product form", "      setIsFormOpen(true);\n    });\n  };\n\n  // Open edit product form")

# Fix handleOpenEdit (line 553)
text = text.replace("      setIsFormOpen(true);\n    }\n  }, []);\n\n  // Submit processing", "      setIsFormOpen(true);\n    });\n  }, []);\n\n  // Submit processing")

# Fix handleFormSubmit else block (line 618)
text = text.replace("        });\n      \n      startTransition(() => {\n        setIsFormOpen(false);\n      });\n    } catch (e) {", "        });\n      }\n      startTransition(() => {\n        setIsFormOpen(false);\n      });\n    } catch (e) {")

# Fix reviews list end (line 942)
text = text.replace("      );\n    }\n    });\n\n  return (", "      );\n    });\n  }, [reviews, cars, onApproveReview, onDeleteReview]);\n\n  return (")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(text)

