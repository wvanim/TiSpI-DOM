# Managing Successive Pages in WvAnim

To simplify page navigation, WvAnim presents a two-level structure to the user.

Internally, however, the system is implemented using three levels.

This internal organization reflects the underlying time–space structure.

The following figures illustrate the difference between the user view and the internal structure.

---

# Légende du premier schéma

**Figure 1 – User view: two levels**
```text
Screen
   └ Pages
```
<img width="840" height="361" alt="im65" src="https://github.com/user-attachments/assets/584cbc3c-032d-47e4-bb8f-7d6c5fc12cb1" />

*From the user’s perspective, successive pages appear as a simple two-level structure.

Each page contains its own navigation button.*

---

# Légende du second schéma

**Figure 2 – Internal structure: three levels**
```
Screen
   └ Component (hidden)
        └ Pages
```
Each frame contains one page.
<img width="839" height="382" alt="im66" src="https://github.com/user-attachments/assets/2014d9a4-fc1f-4d33-84de-280e7a245a4a" />


*Internally, the page system is implemented with three levels.

An intermediate component level manages the pages but remains hidden from the user.*

