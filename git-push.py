import os
import sys

# check if commit message provided
if len(sys.argv) != 2:
    print("Please provide a commit message as an argument")
    sys.exit(1)

# get commit message from command line argument
commit_message = sys.argv[1]

# command 1: git add .
os.system("git add .")

# command 2: git commit -m "{commit_message}"
os.system(f"git commit -m \"{commit_message}\"")

# command 3: git push -u origin main
os.system("git push -u origin main")

print("Commit and push completed!")