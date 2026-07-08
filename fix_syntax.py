import re

with open('src/components/AdminDashboard.tsx', 'r') as f:
    text = f.read()

# Fix the specific issues introduced
text = text.replace("    img.src = dataUrl;\n  }\n  });", "    img.src = dataUrl;\n  });")
text = text.replace("          reader.readAsDataURL(file);\n        }\n    });", "          reader.readAsDataURL(file);\n        });")
text = text.replace("          photos: finalPhotos,\n        }\n        });", "          photos: finalPhotos,\n        });")
text = text.replace("          photos: finalPhotos,\n        }\n      \n        });", "          photos: finalPhotos,\n        });")
text = text.replace("              )}            </div>          </td>        </tr>      );\n    }\n    });\n  },", "              )}            </div>          </td>        </tr>      );\n    });\n  },")

with open('src/components/AdminDashboard.tsx', 'w') as f:
    f.write(text)

