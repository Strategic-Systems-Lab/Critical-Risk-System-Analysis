print("\n=== CIVILIZATION SECURITY SYSTEM 3.0.1 ===\n")

def ask(text, default):
value = input(f"\n{text} [{default}]: ")
return value or default

def ask_int(text, default, min_val, max_val):
while True:
try:
value = input(f"\n{text} [{default}]: ")
if value == "":
return default
value = int(value)
if min_val <= value <= max_val:
return value
else:
print(f"Please enter a value between {min_val} and {max_val}.")
except:
print("Invalid input.")

# ================= CATEGORY =================
print("System Class:\n1 - Company\n")
category = input("Selection: ")
if category != "1":
print("Not implemented yet.")
exit()

print("\n--- COMPANY MODE (SYSTEM 3.0.1) ---\n")

company = ask("Company", "Fictional Corp")
years = ask_int("Simulation duration (years)", 5, 1, 20)

# ================= PROFILES =================
print("\nSelect company profile:\n")
print("1 - Startup")
print("2 - Corporation")
print("3 - Crisis Company")
print("4 - Tech Giant")
print("5 - Mid-sized Business")
print("6 - Manual configuration\n")

profile = input("Selection (1-6): ")

preset = {}
if profile == "1":
preset = {"employees":50,"materials":40,"assets":500,"cashflow":4,"innovation":8,"risk_tolerance":7,"digitization":7,"cybersec":4,"training":4,"compliance":3,"culture":7,"redundancy":2,"ai_usage":5,"adaptability":8,"transparency":6,"style":"visionary"}

elif profile == "2":
preset = {"employees":5000,"materials":80,"assets":8000,"cashflow":7,"innovation":6,"risk_tolerance":4,"digitization":6,"cybersec":7,"training":6,"compliance":8,"culture":6,"redundancy":7,"ai_usage":6,"adaptability":5,"transparency":6,"style":"stable"}

elif profile == "3":
preset = {"employees":800,"materials":50,"assets":2000,"cashflow":2,"innovation":3,"risk_tolerance":6,"digitization":3,"cybersec":3,"training":3,"compliance":4,"culture":3,"redundancy":3,"ai_usage":4,"adaptability":3,"transparency":3,"style":"authoritarian"}

elif profile == "4":
preset = {"employees":12000,"materials":90,"assets":9500,"cashflow":9,"innovation":9,"risk_tolerance":5,"digitization":9,"cybersec":8,"training":7,"compliance":7,"culture":7,"redundancy":8,"ai_usage":9,"adaptability":8,"transparency":6,"style":"visionary"}

elif profile == "5":
preset = {"employees":350,"materials":65,"assets":3500,"cashflow":6,"innovation":6,"risk_tolerance":5,"digitization":5,"cybersec":5,"training":6,"compliance":6,"culture":7,"redundancy":5,"ai_usage":4,"adaptability":6,"transparency":6,"style":"stable"}

if profile in ["1","2","3","4","5"]:
print("\n--- Core parameter adjustment available ---")
employees = ask_int("Employees", preset["employees"], 1, 9999)
materials = ask_int("Materials (%)", preset["materials"], 0, 100)
assets = ask_int("Assets", preset["assets"], 1, 9999)
cashflow = ask_int("Cashflow 1-10", preset["cashflow"], 1, 10)
innovation = ask_int("Innovation level", preset["innovation"], 1, 10)
risk_tolerance = ask_int("Risk tolerance", preset["risk_tolerance"], 1, 10)
digitization = ask_int("Digitization", preset["digitization"], 1, 10)
cybersec = ask_int("Cybersecurity", preset["cybersec"], 1, 10)
training = ask_int("Training", preset["training"], 1, 10)
compliance = ask_int("Compliance", preset["compliance"], 1, 10)
culture = ask_int("Culture", preset["culture"], 1, 10)
redundancy = ask_int("Redundancy", preset["redundancy"], 1, 10)
ai_usage = ask_int("AI usage", preset["ai_usage"], 1, 10)
adaptability = ask_int("Adaptability", preset["adaptability"], 1, 10)
transparency = ask_int("Transparency", preset["transparency"], 1, 10)
style = ask("Leadership style", preset["style"])

else:
print("\n--- Manual configuration ---")
employees = ask_int("Employees", 500, 1, 9999)
materials = ask_int("Materials (%)", 70, 0, 100)
assets = ask_int("Assets", 3000, 1, 9999)
cashflow = ask_int("Cashflow 1-10", 5, 1, 10)
innovation = ask_int("Innovation level", 5, 1, 10)
risk_tolerance = ask_int("Risk tolerance", 5, 1, 10)
digitization = ask_int("Digitization", 5, 1, 10)
cybersec = ask_int("Cybersecurity", 5, 1, 10)
training = ask_int("Training", 5, 1, 10)
compliance = ask_int("Compliance", 5, 1, 10)
culture = ask_int("Culture", 5, 1, 10)
redundancy = ask_int("Redundancy", 5, 1, 10)
ai_usage = ask_int("AI usage", 5, 1, 10)
adaptability = ask_int("Adaptability", 5, 1, 10)
transparency = ask_int("Transparency", 5, 1, 10)
style = ask("Leadership style", "stable")

# ================= SIMULATION =================
burnout_base = {"aggressive":35,"cooperative":10,"authoritarian":40,"visionary":25,"stable":20}.get(style,20)

stability = 60
burnout = burnout_base
financial = cyber = automation = knowledge = dependency = market = operational = governance = reputation = 30

for y in range(1, years+1):
burnout += risk_tolerance*2 - training - culture
financial += 12 - cashflow - assets//1000
cyber += ai_usage*3 - cybersec*4
automation += ai_usage*4 - compliance*2
knowledge += burnout//10 - training
dependency += risk_tolerance*2 - redundancy*3
market += 10 - adaptability*2 - innovation
operational += 10 - compliance*2 - redundancy
governance += 10 - compliance*2 - transparency
reputation += governance//10 + burnout//10
stability += (culture + training + redundancy + compliance) - (burnout//10 + financial//10)
stability = min(99, max(10, stability))

# ================= DASHBOARD =================
print("\n===== FINAL STATE AFTER", years, "YEARS =====\n")
print("Company:", company.upper())
print("Employees:", employees)
print("Assets:", assets)
print("Stability:", stability, "%")

risks = {
"Burnout": burnout,
"Financial": financial,
"Cyber": cyber,
"Automation": automation,
"Knowledge": knowledge,
"Dependency": dependency,
"Market": market,
"Operational": operational,
"Governance": governance,
"Reputation": reputation
}

print("\n-- RISKS --")
for k,v in risks.items():
print(k, ":", min(100,max(1,int(v))), "%")

avg = sum(risks.values()) / len(risks)
worst = max(risks, key=risks.get)

# ================= ADVANCED AI =================
print("\n=== AI STRATEGIC OVERALL ANALYSIS ===\n")
print(f"Total system load: {int(avg)} %")
print("Dominant risk:", worst)

print("\n--- Root cause analysis ---")
if burnout > 60:
print("• High employee stress due to leadership style, insufficient training, or weak culture.")
if financial > 60:
print("• Financial instability caused by weak cashflow or insufficient assets.")
if cyber > 60:
print("• Critical cyber risk: AI usage exceeds security level.")
if governance > 60:
print("• Weak governance: compliance structures and transparency insufficient.")
if dependency > 60:
print("• High dependency due to lack of redundancy.")

print("\n--- AI strategic recommendations ---")
if burnout > 50:
print("→ Invest in leadership culture, workload reduction, and employee development.")
if financial > 50:
print("→ Stabilize cashflow, build reserves, analyze cost structure.")
if cyber > 50:
print("→ Prioritize cybersecurity, scale AI only with proper security framework.")
if governance > 50:
print("→ Strengthen compliance and governance structures, increase transparency.")
if avg < 40:
print("→ System overall robust. Focus on optimization.")
elif avg < 60:
print("→ System functional but strategically at risk.")
else:
print("→ System structurally unstable. Long-term realignment recommended.")
