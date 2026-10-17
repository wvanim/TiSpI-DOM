/*! tispi.js — the TiSpI engine in one file, with its comments.
 *  Copyright (c) 2026 Philippe Destrumel — https://github.com/wvanim/TiSpI
 *  Licensed under CC BY-NC-ND 4.0 — https://creativecommons.org/licenses/by-nc-nd/4.0/
 */
// Development note: assembled on 2026-10-15 from 14 source files, in this order:
// tispiTools → tispiParser → tispiUndo → tispiTrack → tispiCore → tispiPiece → tispiTracksCss → tispiVar → tispiBuild → tispiGroup → tispiLayout → tispiFuncs → tispiLang.fr → tispiEditor
// Each section below opens with a banner naming its source file.


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiTools.js  (1182 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// tispiTools.js

//        #####      #########       #########       ########       ###########      
//       ########    ####    ####   ####    ####     ####  ####     ####        
//      ####  ####   ####    ####   ####             ####    ####   ####        
//      ####  ####   ##########     ####             ####    ####   ########    
//     ############  ####    ####   ####             ####    ####   ####        
//     ####    ####  ####    ####   ####    ####     ####  ####     ####        
//     ####    ####  #########       #########       ########       ###########
//
//     ###########    #########      ####    ####       ####            ####
//     ####          ####    ####    ####    ####       ####            ####
//     ####          ####            ####    ####       ####            ####
//     #########     ####  ######    ############       ####            ####
//     ####          ####  ######    ####    ####       ####            ####
//     ####          ####    ####    ####    ####       ####    ####    ####
//     ####           #########      ####    ####       ####      ########  
//    
//
//     ####    ####   ####      ####        ####    ####     ####       ########  
//     ####   ####    ####      ######    ######    ######   ####      ####  #### 
//     ####  ####     ####      #######  #######    #######  ####     ####    ####
//     ########       ####      #### ###### ####    #### ### ####     ####    ####
//     ####  ####     ####      ####  ###   ####    ####  #######     ####    ####
//     ####   ####    ####      ####   ##   ####    ####   ######      ####  #### 
//     ####    ####   ######### ####        ####    ####     ####       ########  
//
//
//     ##########      ########    ############      #########       ###########
//     ####    ####   ####  ####   ####     ####    ####    ####        ####    
//     ####    ####  ####    ####  ####     ####      ####              ####    
//     ##########    ####    ####  ############          ####           ####    
//     ####          ####    ####  ####   ####              ####        ####    
//     ####        #######  ####   ####    ####     ####    ####        ####    
//     ####        ############    ####     ####      ########          ####    
//
//
//   ####    ####   ####    ####   ####    ####    ####    ####  ###########
//   ####    ####   ####    ####   ####    ####    ####    ####        ####       
//   ####    ####    ####  ####     ####  ####      ####  ####       ####       
//   ####    ####    ####  ####       ######         ########       ####
//   ####    ####     ########      ####  ####         ####        ####       
//    ####  #####      ######      ####    ####        ####       ####       
//     ##########       ####       ####    ####        ####      ###########



class TsiError{
    static warning(message){
        alert(message);
    }
    static error(message){
         throw new Error(message);
    }
    static debug(message){
        console.log(message);
    }
    static info(message){
        console.log(message);
    }
    // Alert avec choix : 1 = l'utilisateur choisit `yes`, 0 sinon (OK = yes, Annuler = no).
    static request(message, yes, no){
        return confirm(message + "\nOK = " + yes + " / Annuler = " + no) ? 1 : 0;
    }
    /** Question bloquante à N choix — v1 : prompt numéroté (l'éditeur branchera son
     *  dialogue ici). Réponse invalide ou Annuler → DERNIER choix (le refus = repli sûr). */
    static choice(message, options){
        const menu = options.map((o, i) => `${i} = ${o}`).join('\n');
        const rep  = parseInt(prompt(message + '\n' + menu, '0'), 10);
        return (rep >= 0 && rep < options.length) ? rep : options.length - 1;
    }
    static callerFilter(filter, caller, callerName, message){
        if(filter && (caller==null || caller.name!=callerName)) {
            TsiError.error("Fonction privée, ne peut être appelée que par  "+callerName+". "+message);
        }          
    } 

}
class TsiEase{
 static cubicBezier(x1, y1, x2, y2) {
  const cx = 3*x1, bx = 3*(x2-x1)-cx, ax = 1-cx-bx;
  const cy = 3*y1, by = 3*(y2-y1)-cy, ay = 1-cy-by;
  const X  = t => ((ax*t + bx)*t + cx)*t;
  const Xd = t => (3*ax*t + 2*bx)*t + cx;       // dérivée (Newton)
  const Y  = t => ((ay*t + by)*t + cy)*t;
  return p => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let t = p;                                  // Newton-Raphson
    for (let i = 0; i < 4; i++) {
      const x = X(t) - p;
      if (Math.abs(x) < 1e-6) return Y(t);
      const d = Xd(t);
      if (Math.abs(d) < 1e-6) break;
      t -= x / d;
    }
    let lo = 0, hi = 1; t = p;                   // bissection de secours
    while (hi - lo > 1e-6) {
      const x = X(t);
      if (x < p) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return Y(t);
  };
 }

 static EASE_CP = {
  ease:          [0.25, 0.1, 0.25, 1],
  'ease-in':     [0.42, 0,   1,    1],
  'ease-out':    [0,    0,   0.58, 1],
  'ease-in-out': [0.42, 0,   0.58, 1],
 };
 static _easeCache = new Map();
 static ease(p, easing) {
  if (!easing || easing === 'linear') return p;          // identité
  let fn = TsiEase._easeCache.get(easing);
  if (!fn) {
    let cp = TsiEase.EASE_CP[easing];
    if (!cp) { const m = /cubic-bezier\(([^)]+)\)/.exec(easing);
               cp = m ? m[1].split(',').map(Number) : null; }
    fn = cp ? TsiEase.cubicBezier(...cp) : (p => p);
    TsiEase._easeCache.set(easing, fn);
  }
  return fn(p);
 }
}

class valueStack {
  constructor(value) {
    this.value = value;
    this.stack = [];
  }

  get() {
    return this.value;
  }

  push(valueNew) {
    this.stack.push(this.value);
    this.value = valueNew;
    return this.value;
  }

  pop() {
    this.value = this.stack.pop();
    return this.value;
  }

  oper(callback) {
    this.value = callback(this.value);
    return this.value;
  }
}
class counterStack extends valueStack{
    inc(){return ++this.value;}
}    





// Temporairement
// ═══════════════════════════════════════════════════════════════════
//  TsiDragDiv  —  drag + click sur une div
// ═══════════════════════════════════════════════════════════════════

//     ########       ############       #####        #########     
//     ####  ####     ####     ####     ########     ####    ####   
//     ####    ####   ####     ####    ####  ####    ####           
//     ####    ####   ############     ####  ####    ####  ######      
//     ####    ####   ####   ####     ############   ####  ######     
//     ####  ####     ####    ####    ####    ####   ####    ####   
//     ########       ####     ####   ####    ####    #########     

//

class TsiDragDiv {

    static ON_DRAG_START = 'ON_DRAG_START';
    static ON_DRAG       = 'ON_DRAG';
    static ON_DRAG_END   = 'ON_DRAG_END';
    static ON_CLICK      = 'ON_CLICK';

    /**
     * @param {HTMLElement} div
     * @param {object}      opts
     * @param {*}           [opts.balise]   — identifiant de cet élément
     * @param {*}           [opts.valeurs]  — données associées
     * @param {function}    [opts.onClick]  ({ balise, valeurs, state, dx, dy }) → void
     */
    constructor(div, { balise, valeurs, onClick } = {}) {

        div.addEventEventBinding('mousedown', e => {
            e.preventDefault();
            const mx0    = e.clientX;
            const my0    = e.clientY;
            let   isDrag = false;

            const move = e2 => {
                const dx = e2.clientX - mx0;
                const dy = e2.clientY - my0;
                if (!isDrag) {
                    if (Math.hypot(dx, dy) <= 3) return;
                    isDrag = true;
                    onClick?.({ balise, valeurs, state: TsiDragDiv.ON_DRAG_START, dx, dy });
                    return;
                }
                onClick?.({ balise, valeurs, state: TsiDragDiv.ON_DRAG, dx, dy });
            };

            const up = e2 => {
                document.removeEventEventBinding('mousemove', move);
                document.removeEventEventBinding('mouseup',   up);
                const dx    = e2.clientX - mx0;
                const dy    = e2.clientY - my0;
                const state = isDrag ? TsiDragDiv.ON_DRAG_END : TsiDragDiv.ON_CLICK;
                onClick?.({ balise, valeurs, state, dx, dy });
            };

            document.addEventEventBinding('mousemove', move);
            document.addEventEventBinding('mouseup',   up);
        });
    }
}
//        #####      ############     ############       #####       ####    #### 
//       ########    ####     ####    ####     ####     ########     ####    #### 
//      ####  ####   ####     ####    ####     ####    ####  ####     ####  ####  
//      ####  ####   ############     ############     ####  ####      ########   
//     ############  ####   ####      ####   ####     ############       ####     
//     ####    ####  ####    ####     ####    ####    ####    ####       ####     
//     ####    ####  ####     ####    ####     ####   ####    ####       ####     
// 
/**
 * TsiStockPath
 * ----------------------------------------------------------------------------
 * Mémorise le chemin de stockage complet d'un composant dans l'arborescence
 * des tables d'un projet.
 *
 * Chaque niveau du chemin est représenté par :
 *
 *   [tableDeReference, position]
 *
 * où :
 *   - tableDeReference : table contenant directement l'élément ;
 *   - position         : indice occupé dans cette table.
 *
 * Exemple :
 *
 * [
 *   [personneTable, 43], // ← index 0 = stockage direct ✓
 *   [voieTable, 87],
 *   [villeTable, 123],
 *   [paysTable, 2]
 * ] 
 * Ce chemin indique qu'une personne est stockée à la position 43 de
 * personneTable, elle-même contenue dans voieTable[87], puis villeTable[123],
 * puis paysTable[2].
 *
 * Le premier élément du chemin représente toujours le stockage direct
 * du composant :
 *
 *   path[0] === [tableContenante, position]
 *
 * Les niveaux suivants sont conservés afin de :
 *   - reconstituer instantanément l'arborescence complète ;
 *   - faciliter le débogage ;
 *   - vérifier la cohérence des imbrications ;
 *   - permettre de futures opérations de navigation ou de validation.
 *
 * Convention :
 *
 *   this.stockPath = new TsiStockPath(this);
 *
 * Lors de l'insertion dans une table :
 *
 *   composant.stockPath.setAddr([table, position], parent);
 *
 * où parent est le composant contenant, ou null pour une racine.
 *
 * La méthode _freeValue() supprime le composant de sa table de stockage
 * directe en appelant :
 *
 *   table._free(position)
 *
 * puis invalide le chemin mémorisé.
 */
class TsiStockPath{
  constructor(parent){
      this.parent = parent;
      this.path = null;
  }   
  //_________________________________________________________________________________addInStock 
  static getFunctionAdd(isStock, table){
      if(!table._add){
          TsiError.error("Table function table._add() attendue");
      }
      if(!isStock) return TsiStockPath.addNoStock;
      return TsiStockPath.addInStock;
  }
  static addInStock(value){
      const pos = this._add(value, TsiStockPath.addInStock);
      if(value.stockPath === undefined) TsiError.error("Table stock : member 'stockPath' expected in value");
      if(value.stockPath === null) value.stockPath = new TsiStockPath(value);
      value.stockPath.setAddr([this, pos], this);
      return pos;
  }
  static addNoStock(value){
      return this._add(value, null);
  }      
  static addFilter(isStock, caller){
      TsiError.callerFilter(isStock, caller, "addInStock", " Utilisez 'addAt(pos)'");
  } 
  tsiSupprStockPath(){
      if(this.path == null) return;
      const path = this.path;
      this.path = null;
      
      const addr = path[0];
      addr[0]._suppr(addr[1], this.parent, this.tsiSupprStockPath);
  }
  //_________________________________________________________________________________
  static getFunctionSuppr(isStock, table){
      if(!table._suppr){
          TsiError.error("Table function table._suppr() attendue");
      }
      if(!isStock) return TsiStockPath.supprNoStock;
      if(!table.getAt){
          TsiError.error("Table est stock, function table.getAt() attendue");
      }
      return TsiStockPath.supprInStock;
  }
  static supprInStock(value){
      if (value == null) return null;
      if(!value.stockPath.path || value.stockPath.path.length == null) {
          return null;          // ancien path effacé lors de la suppression
      }
      return value.stockPath.tsiSupprStockPath();
  }  
  static supprNoStock(pos){
      return this._suppr(pos, this.getAt(pos), this.supprValue);
  }  
  static supprFilter(isStock, caller ){
      TsiError.callerFilter(isStock, caller, "tsiSupprStockPath", " Utilisez 'supprValue(pos)'");
  } 
  //_________________________________________________________________________________
  setAddr(addr, stock = null) {
      if(this.path!=null) {
           TsiError.error("Composant déjà stocké — stockPath écrasé");
      }
      if (stock != null  && stock.stockPath?.path != null) {
          this.path = [addr,...stock.stockPath.path];
      } else {
          this.path = [addr];
      }
  }
  check() {
      if(this.path == null) return true;
      for(let i = 0; i < this.path.length; i++) {
          const [table, pos] = this.path[i];
          if(table == null || table[pos] == null) {
              TsiError.warning(`TsiStockPath : rupture au niveau ${i} — [${table}, ${pos}]`);
              return false;
          }
      }
      return true;
  }
  toString() {
      if(this.path == null) return "TsiStockPath [non initialisé]";
      return this.path.map(([t, p]) => `${t.constructor.name}[${p}]`).join(" → ");
      // ex : "PaysTable[2] → VilleTable[123] → PersonneTable[43]"
  }

}

// ═══════════════════════════════════════════════════════════════════
//  TsiArrayFree  —  allocateur de slots O(1) — liste doublement chaînée circulaire
//  _tabFree[i] : next libre (si libre) | next occupé (si occupé)
//  _tabPrev[i] : prev occupé (si occupé, ignoré si libre)
// ═══════════════════════════════════════════════════════════════════
class TsiStockArray{
    constructor(isStock){
        this.isStock = isStock;
        this.stockPath = null;
        this.supprValue = TsiStockPath.getFunctionSuppr(isStock, this);
        this.addValue = TsiStockPath.getFunctionAdd(isStock, this);
    }
}
// ═══════════════════════════════════════════════════════════════════
//  TsiArrayAccess  —  tableau à allocation de slots
// ═══════════════════════════════════════════════════════════════════
//
//        #####         #########       #########       ###########     #########  
//       ########      ####    ####    ####    ####     ####           ####    ####
//      ####  ####     ####            ####             ####             ####      
//      ####  ####     ####            ####             ########            ####   
//     ############    ####            ####             ####                   ####
//     ####    ####    ####    ####    ####    ####     ####           ####    ####
//     ####    ####     #########       #########       ###########      ########  
//   

class TsiArrayFree extends TsiStockArray{
  constructor(size = 16, isStock=false) {
    super(isStock);
    if (new.target === TsiArrayFree)
      TsiError.error("TsiArrayFree est abstraite — instanciation directe interdite");
    this._tabFree = Array.from({ length: size }, (_, i) => i < size - 1 ? i + 1 : -1);
    this._tabPrev = new Array(size).fill(-1);
    this._ptFree  = 0;    // tête de chaîne libre
    this._ptOcc   = -1;   // tête de chaîne occupée
  }

  // Tête libre → tête occupée (circulaire doublement chaînée)
  _alloc() {
    if (this._ptFree === -1) this.#grow();

    const newSlot    = this._ptFree;
    this._ptFree     = this._tabFree[newSlot];   // avancer ptFree AVANT d'écraser

    const oldHead    = this._ptOcc;
    this._ptOcc      = newSlot;

    if (oldHead === -1) {
      // Premier élément : circulaire sur lui-même
      this._tabFree[newSlot] = newSlot;
      this._tabPrev[newSlot] = newSlot;
    } else {
      // Insérer newSlot avant l'ancienne tête
      const tailIdx          = this._tabPrev[oldHead];  // oldHead.prev = queue
      this._tabFree[newSlot] = oldHead;                  // new.next  = oldHead
      this._tabPrev[newSlot] = tailIdx;                  // new.prev  = tail
      this._tabPrev[oldHead] = newSlot;                  // oldHead.prev = new
      this._tabFree[tailIdx] = newSlot;                  // tail.next  = new
    }

    return newSlot;
  }

  // Suppression arbitraire O(1)
  _free(posSuppr) {
    const prevOcc = this._tabPrev[posSuppr];   // sauver prev AVANT d'écraser
    const nextOcc = this._tabFree[posSuppr];   // sauver next AVANT d'écraser

    // Remettre en tête de chaîne libre
    this._tabFree[posSuppr] = this._ptFree;
    this._ptFree            = posSuppr;

    // Un seul élément
    if (prevOcc === posSuppr) {
      this._ptOcc = -1;
      return;
    }

    // Suppression de la tête → avancer ptOcc
    if (this._ptOcc === posSuppr) this._ptOcc = nextOcc;

    // Relier précédent et suivant
    this._tabFree[prevOcc] = nextOcc;   // prev.next = next
    this._tabPrev[nextOcc] = prevOcc;   // next.prev = prev
  }

  #grow() {
    const start = this._tabFree.length;
    const end   = start * 2;
    for (let i = start; i < end; i++) {
      this._tabFree.push(i < end - 1 ? i + 1 : -1);
      this._tabPrev.push(-1);
    }
    this._ptFree = start;
  }
}

class TsiArrayAccess extends TsiArrayFree{
  constructor(size = 16, isStock=false) {
    super(size, isStock);
    this._data = new Array(size).fill(null);
    this._version = 0;
  }
  getAt(pos){
    if (pos < 0 || pos >= this._data.length) return null;
    return this._data[pos];
  }
  *values() { for (const v of this._data) if (v !== null) yield v; }   // parcours des composants vivants (trous sautés) — PD 04/10, politique d'onglet
  /** Ajoute une valeur. Retourne sa position — indispensable pour supprValue(). */
  _add(value, caller=null){
      TsiStockPath.addFilter(this.isStock, caller);
      if (value === null)
          TsiError.error("TsiArrayAccess : addValue(null) interdit");
      this._version++;                          // après validation
      const posOcc = super._alloc();
      if (posOcc >= this._data.length) this._data.length = posOcc + 1;
      this._data[posOcc] = value;
      return posOcc;
  }      
  /** Retire et retourne la valeur à la position donnée. */
  _suppr(pos, value, caller=null){
      TsiStockPath.supprFilter(this.isStock, caller);   // ✓
      this._version++;                          // après validation
      this._data[pos] = null;
      super._free(pos);
      return value;
  }
  /**
   * pour interdire l'accès TsiArrayFree._free() à d'autres sources
   */
  _free(){
      TsiError.error("TsiArrayAccess : _free() est une méthode interne. Utiliser supprValue().");
  }
  /**
   * pour interdire l'accès TsiArrayFree._alloc() à d'autres sources
   */
  _alloc(){
      TsiError.error("TsiArrayAccess : _alloc() est une méthode interne. Utiliser addValue().");
  }
  
  iterator() {
      return [-1, this._ptOcc, this._version];  // pas de ++
  }
  
  iteratorNext(iterator) {
      if (this._version !== iterator[2]) {      // pas de crochets
          TsiError.warning("Table modifiée durant l'itération.");
          return null;
      }
      const id = iterator[0] = iterator[1];
      if (id === -1) return null;
      const next = this._tabFree[id];
      iterator[1] = (next === this._ptOcc) ? -1 : next;  // stop circulaire
      return this._data[id];
  }
  
  iteratorGet(iterator) {
      if (this._version !== iterator[2]) {      // pas de crochets
          TsiError.warning("Table modifiée durant l'itération.");
          return null;
      }
      return this._data[iterator[0]];
  }
}
// ═════════════════════════════════════════════════════════════════════════════
//  LE POINTEUR vers un composant enregistré — l'ITEM du registre TsiComposPt
// ═════════════════════════════════════════════════════════════════════════════
//  Trois champs NOMMÉS là où il y avait un tableau à indices (ex-ID_UNIC/POS) :
//  plus de constantes à retenir, et la RÉSOLUTION devient une méthode du pointeur.
//    uid    — génération : distingue deux occupants successifs d'une même place
//    pos    — la place dans le registre
//    table  — LE REGISTRE d'appartenance : le pointeur sait où se résoudre, donc
//             un détenteur peut désigner N'IMPORTE QUEL composant (Pièce, Face,
//             demain une piste) sans savoir de quel type il s'agit. C'est ce qui
//             permet à un TsiListener de tenir un `dest` quelconque.
//             La référence ne fuit pas : un registre est un singleton permanent.
class TsiIdUnic {
  constructor(uid, pos, table) { this.uid = uid; this.pos = pos; this.table = table; }

  //  ⚠ `onStale` est OBLIGATOIRE : Tispi ne balaie JAMAIS les liens à la mort d'un
  //  composant — le nettoyage est NATUREL, il se fait ICI, à la lecture, par le
  //  détenteur du lien, seul à savoir où il le range. Un détenteur qui n'a rien à
  //  nettoyer passe une fonction vide, et ce vide est alors une DÉCISION écrite.
  //  CONCORDANCE (index à génération) : `pos` dit où chercher, `uid` dit si c'est
  //  toujours le même occupant — une place reprise rend null, jamais le mauvais nœud.
  get(onStale) {
    if (typeof onStale !== 'function')
      TsiError.error("TsiIdUnic.get : callback de suppression obligatoire (le lien mort se retire chez son détenteur)");
    const component = this.table.getAt(this.pos);
    if (!component || component.idUnic?.uid !== this.uid) {
      if (o_.debugLinks) TsiError.debug(`lien périmé ${this.uid}/${this.pos}`);
      onStale();
      return null;
    }
    return component;
  }

  remove() { return this.table.remove(this); }   // libère la place ET coupe le lien
}

//  LE REGISTRE — il ne possède que la PLACE ; la résolution appartient au pointeur.
class TsiComposPt extends TsiArrayAccess  {
  constructor() {
    super(64);
    this.idPieceUnic = 0;
  }
  put(component){
    if (!component) TsiError.error("put : Composant null");
    if(component.idUnic===undefined) TsiError.error("put : Composant sans idUnic");
    if (component.idUnic != null){
      const componentOld = this.getAt(component.idUnic.pos);
      if(componentOld!==null && componentOld!==component){
        TsiError.error("put 'tabAccess': la position est déjà utilisée par un autre composant");
      }
      return component.idUnic;
    }
    return component.idUnic = new TsiIdUnic(++this.idPieceUnic, this.addValue(component), this);
  }
  remove(idUnic){
    if (idUnic == null) return null;
    const component = this.getAt(idUnic.pos);
    if (!component) return null;
    if (component.idUnic.uid !== idUnic.uid)
      TsiError.error("remove component in 'tabAccess' annulé : le composant n'est pas à la position attendue");
    this.supprValue(idUnic.pos);
    component.idUnic = null;
    return component;
  }
}
  

// ═══════════════════════════════════════════════════════════════════
//  TsiNameIndexed  —  accès par nom via dichotomie
//
//  Deux tableaux parallèles maintenus triés par nom :
//    _namesSorted[]    — noms (strings), triés alphabétiquement
//    _datas[]  — valeurs associées (index dans un tableau externe)
//                Chaque data nommé "valueNamed" comporte getName()
//
//  add(nameValue) — insère en maintenant l'ordre trié  O(n) (splice)
//  get(name)        — recherche dichotomique              O(log n)
//                     retourne la valeur ou null si absent
//
//  Pas de suppression — registre append-only.
//  L'index retourné par get() peut être mis en cache par l'appelant
//  pour des accès ultérieurs en O(1) pur.
// ═══════════════════════════════════════════════════════════════════
class TsiNameIndexed extends TsiStockArray{
  constructor( isStock=null ) {
      super(isStock)
    this._namesSorted   = [];   // noms triés
    this._posValue=[];     // position de la valeur
    this._datas = [];   // valeurs correspondante
  }
  _add(valueNamed, caller=null) { 
    TsiStockPath.addFilter(this.isStock, caller);
    const name = valueNamed.getName();
    const posSorted = this._posSortedStrict(name, false);
    if (posSorted==null) return null;   // déjà présent
    
    const lg = this._datas.length;
    this._namesSorted.splice(posSorted, 0, name);
    this._posValue.splice(posSorted, 0, lg);
    this._datas.push(valueNamed);
    return lg;
  }

  getAt(pos){
      if(pos<0 || pos>=this._datas.length){return null;}          
      return this._datas[pos];
  }
  /**
   * Recherche dichotomique par nom.
   * @param  {string} name
   * @returns {[pos]|null}  valeur associée, ou null si absent
   */
  get(name) {
    const posSorted = this._posSortedStrict(name, true);
    return posSorted != null ? this._datas[this._posValue[posSorted]] : null;
  }
  /**
   * parameters 
   * - name : nom recherché
   * - isPresent : indique si le nom doit être présent - true - ou absent - false - pour retourner la position  
   */
  _posSortedStrict(name, isPresent) {
      const pos = this._posSorted(name);
      return (isPresent === (this._namesSorted[pos] === name))
        ? pos : null;   
  }

  /**
   * Recherche dichotomique — retourne la position d'insertion.
   * Si _namesSorted[posSorted] === name, le nom existe à cette position.
   * @param  {string} name
   * @returns {number}
   */
  _posSorted(name) {
    if (name == null) TsiError.error("TsiNameIndexed : name ne peut pas être null"); 
    let lo = 0, hi = this._namesSorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this._namesSorted[mid] < name) lo = mid + 1;
      else                         hi = mid;
    }
    return lo;
  }
  _suppr(pos, value, caller=null){
    TsiStockPath.supprFilter(this.isStock, caller);
    const data = this._datas[pos];
    if(data == null) return;
    const posSorted = this._posSortedStrict(data.getName(), true);
    if(posSorted==null) return false;
    
    this._namesSorted.splice(posSorted, 1);
    this._posValue.splice(posSorted, 1);
    this._datas[pos] = null;
    return value;
  }
}
//_________________________________________________________________________________

//_________________________________________________________________________________
//_________________________________________________________________________________
class TsiNameValue {
    constructor(name, value) {
        this.value = value;
        this.name  = name;
        this.stockPath = null;
    }
    getName(){return this.name;}
    getValue(){return this.value;}
}

class TsiNameIndexedFree extends TsiArrayFree{
  constructor(size=4, isStock=null) {
    super(size, isStock)
    this._namesSorted   = [];   // noms triés
    this._posValue=[];     // position de la valeur
    this._datas = new Array(size).fill(null);   // valeurs correspondante
    this._version = 0;
  }

  _add(valueNamed, caller=null) { 
    TsiStockPath.addFilter(this.isStock, caller);
    const name = valueNamed.getName();
    const posSorted = this._posSortedStrict(name, false);
    if (posSorted==null) return null;   // déjà présent
    
    this._version++;                          // après validation
    const posOcc = super._alloc();
    if (posOcc >= this._datas.length) this._datas.length = posOcc + 1;
    this._namesSorted.splice(posSorted, 0, name);
    this._posValue.splice(posSorted, 0, posOcc);
    this._datas[posOcc]=valueNamed;
    return posOcc;
  }
  getAt(pos){
      if(pos<0 || pos>=this._datas.length){return null;}          
      return this._datas[pos];
  }
  /**
   * Recherche dichotomique par nom.
   * @param  {string} name
   * @returns {[pos]|null}  valeur associée, ou null si absent
   */
  get(name) {
    const posSorted = this._posSortedStrict(name, true);
    return posSorted != null ? this._datas[this._posValue[posSorted]] : null;
  }
  /**
   * parameters 
   * - name : nom recherché
   * - isPresent : indique si le nom doit être présent - true - ou absent - false - pour retourner la position  
   */
  _posSortedStrict(name, isPresent) {
      const pos = this._posSorted(name);
      return (isPresent === (this._namesSorted[pos] === name))
        ? pos : null;   
  }

  /**
   * Recherche dichotomique — retourne la position d'insertion.
   * Si _namesSorted[posSorted] === name, le nom existe à cette position.
   * @param  {string} name
   * @returns {number}
   */
  _posSorted(name) {
    if (name == null) TsiError.error("TsiNameIndexed : name ne peut pas être null"); 
    let lo = 0, hi = this._namesSorted.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this._namesSorted[mid] < name) lo = mid + 1;
      else                         hi = mid;
    }
    return lo;
  }
  _suppr(pos, value, caller=null){
    TsiStockPath.supprFilter(this.isStock, caller);
    const data = this._datas[pos];
    if(data == null) return;
    const posSorted = this._posSortedStrict(data.getName(), true);
    if(posSorted==null) return false;
    
    this._version++;            
    this._namesSorted.splice(posSorted, 1);
    this._posValue.splice(posSorted, 1);
    this._datas[pos] = null;
    super._free(pos);
    return value;
  }
}


//_________________________________________________________________________________


class TsiHubEvent{
  static COMMON = 0;
  static EDITOR =1;  
  constructor() {
    this._registry   = new TsiNameIndexed(true);
    this.tables = [[], []];   // [dataId] → eventBindings
  }
  /**
   * Ajoute une table dédiée à une classe d'événements dans le hub.
   * Exemple :
   *   addClassEventBinding("PieceResized", TsiHubEvent.COMMON)
   * Crée une TsiEventBindingTable, puis l'enregistre dans la table
   * correspondant à tableNum.
   * this._registry.add(name, this.tables[tableNum], eventBindingTable)
   * ajoute eventBindingTable dans this.tables[tableNum] et associe name
   * à son emplacement.
   */
  /*addClassEventBinding(name, tableNum) {
      const eventBindingTable = new TsiEventBindingTable(name, true);
      this._registry.addValue(eventBindingTable);
  }*/
  addClassEventBinding(name, tableNum) {
      // 1. Création de la table de liaison pour cette classe d'événement
      const eventBindingTable = new TsiEventBindingTable(name, true);
      
      // 2. Enregistrement dans le répertoire indexé par nom
      // Note : On suppose ici que _add est accessible ou renommée en add
      const dataIndex = this._registry._add(eventBindingTable); 
      
      if (dataIndex !== null && this.tables[tableNum]) {
          // 3. Stockage de la table de liaison dans le groupe (COMMON ou EDITOR)
          // en utilisant l'index unique généré par TsiNameIndexed
          this.tables[tableNum][dataIndex] = eventBindingTable;
      }
  }  
  getClassEventBinding(name){
      return this._registry.get(name);
  }
  removeEventBinding(name, idEventBinding){
      let classEventBinding = this.getClassEventBinding(name);
      if(classEventBinding == null) return null;
      return classEventBinding.supprValue(idEventBinding);  
  }
  sendEvent(name, source, eventParams){
    const classEventBinding = this.getClassEventBinding(name);
    if(!classEventBinding) return false;
    classEventBinding.sendEvent(source, eventParams);
  }

  unhandleEventBinding(eventBinding) {
      eventBinding.stockPath.tsiSupprStockPath();
  }  
}
/**
 * Tableau des instances de eventBindings d'une classe eventBinding accrochés à un hub-event
 *  
 */
class TsiEventBindingTable extends TsiArrayAccess{
    constructor(name, isStock){
        super(4, isStock);
        this.name = name;
    }
    getName(){return this.name;}
    sendEvent(source, eventParams){
        const iterator = this.iterator();
        let iteratorCurr;
        while(iteratorCurr = this.iteratorNext(iterator)){
            try {
                iteratorCurr.listener[iteratorCurr.onEventName](source, eventParams);
            } catch(e) {
                TsiError.warning("Erreur listener : " + e);
            }
        }
    }
}
class TsiEventBinding{
    constructor(source, listener, onEventName){
        this.source = source;
        this.listener = listener;
        this.onEventName = onEventName;
        this.stockPath   = new TsiStockPath(this);  
    }
    /**
     * Information envoyée lorsque l'eventBinding est accroché 
     * référence :
     *    TsiEventBindingTable.add();
     */
     unhandle(){ this.stockPath.tsiSupprStockPath();}
}
/* A revoir
  addTable(num) { return this._add(num); }

  _add(name, num) {
    const id = this._registry.add(name, table);  // réserve table[dataId]
    if (id === false) return this._registry.get(name);
    table[id[1]] = { _cbs: [], _next: 0 };       // crée le branchement
    return id;                                    // [tableRef, dataId]
  }

  on(id, cb) {
    const h = id[0][id[1]];
    const t = h._next++;
    h._cbs[t] = cb;
    return t;
  }
  off(id, token)  { id[0][id[1]]._cbs[token] = null; }
  dispatch(id, d) { for (const cb of id[0][id[1]]._cbs) cb?.(d); }
*/

// Exemple simplifié : une seule propriété "left", deux keys
// key A → key B, avec ou sans transition
/*
function execKey(div, keyValue, nextKeyValue, transitionMs) {

  // 1) Poser la valeur de la key courante
  const left = keyValue + 'px';

  if (transitionMs > 0) {
    // ── SÉQUENCE "avec transition" ──────────────────────────
    // a) point de départ = valeur actuelle affichée
    const from = { left: getComputedStyle(div).left };
    // b) point d'arrivée = valeur de la PROCHAINE key
    const to   = { left: nextKeyValue + 'px' };

    // c) lance l'anim CSS de from → to, sur la durée de l'intervalle
    const anim = div.animate([from, to], {
      duration: transitionMs,
      fill: 'forwards'
    });

    // d) à la fin de l'intervalle → on arrive sur la key suivante
    setTimeout(() => {
      // ici on rappellera execKey(div, nextKeyValue, ...) pour la key suivante
      console.log('arrivée key suivante (avec transition), valeur =', nextKeyValue);
    }, transitionMs);

  } else {
    // ── SÉQUENCE "sans transition" ──────────────────────────
    // a) on pose directement la valeur de la key, tout de suite
    div.style.left = left;

    // b) "intervalle" de durée 0 → on enchaîne immédiatement sur la key suivante
    setTimeout(() => {
      console.log('arrivée key suivante (sans transition), valeur =', nextKeyValue);
    }, 0);
  }
}


execTransition(track, keyIndex, animMs, ease, delayMs = 0) {
    const totalMs = animMs + delayMs;
    clearTimeout(track._animTimer);
    this.animName = track.prop;
    //this.setTransition(track, animMs, ease, delayMs);  // transit() → arme _pending
    this._pending = animMs ? { animMs, ease, delayMs } : null;
    
    if(delayMs!=0) prop.setTransition(...)   // => prop.transition()
    else prop.setCss(...); // =                           // setCss → _pending.duration>0 → animate()

    track._animTimer = setTimeout(() => {
        this.animName    = null;
        track._animTimer = null;
        track.keys[keyIndex]?.exec(track, keyIndex);   // ← rappelle exec() = key suivante !
    }, totalMs);
}


class TsiCssPosition {
    
transition(value, valueDest, track){
   const div  = track.pieceMaster.div;
   track._anim?.cancel();
   track._anim = div.animate(
     [track.toValueProp(value), track.toValueProp(valueDest)],
     { duration: track._pending.duration, easing: track._pending.ease.getCss(),
       delay: track._pending.delay, fill: 'forwards' }
   );    
}
toValueProp(value){
    return [Number.isFinite(value[0]) ? value[0] + 'px' : value[0],
            Number.isFinite(value[1]) ? value[1] + 'px' : value[1]];
}    
setCss(value, track, duration) {
      this._anim = null;
      consst [left,top] = toValueProp(value)
      div.style.left = left;
      div.style.top  = top;
    }
}





Si il faut écrire un setCss aussi lourd pour chaque propriété, on enfle le projet.

*/


//     ###########   ####     ####   ###########   ####     ####   ###########
//     ####          ####     ####   ####          #####    ####      ####    
//     ####          ####     ####   ####          ######   ####      ####    
//     #########      ####   ####    #########     #### ### ####      ####    
//     ####            #### ####     ####          ####   ######      ####    
//     ####             #######      ####          ####    #####      ####    
//     ###########       #####       ###########   ####     ####      ####    

// ═════════════════════════════════════════════════════════════════════════════
//  LES ÉVÉNEMENTS D'UN NŒUD — mécanique GÉNÉRALE (PD 2026-08-16)
// ═════════════════════════════════════════════════════════════════════════════
//  Deux collections et leur item, chacun citoyen de la grammaire :
//    TsiEvents     Map   — nom d'événement → ses abonnés
//    TsiListeners  Array — les abonnés d'UN événement, dans l'ordre d'abonnement
//    TsiListener         — UN abonné : le couple (dest, action)
//
//  Map et non Array pour le contenant : la clé est un NOM, pas un rang — un Array
//  indexé par des chaînes range hors de `length`, invisible à l'itération (c'est
//  la correction déjà faite sur piece.vars → TsiVars extends Map).
//
//  ⚠ LE CONTEXTE EST CELUI DU SENDER (PD) : `_ctx_` décrit la situation de
//    l'ÉMETTEUR, et c'est l'émetteur qui le construit — un TsiCtx par tir, jamais
//    recopié. Les abonnés le reçoivent, ils ne le fabriquent pas.
//  ⚠ `dest` désigne UNIQUEMENT le nœud abonné : c'est l'identité de l'abonnement,
//    ce par quoi on le retire (suppr). Il ne porte pas l'exécution.
//
//  C'est le LISTENER (la cible) qui va s'inscrire chez la SOURCE : la source ne
//  connaît pas ses abonnés à l'avance, elle diffuse à qui s'est présenté.
// ═════════════════════════════════════════════════════════════════════════════

//  UN ABONNÉ — le couple (nœud abonné, action à tirer).
//  ⚠ `dest` est un POINTEUR (TsiIdUnic), PAS une référence : une référence
//  retiendrait l'abonné en vie pour toujours, même flushé — l'abonnement serait
//  une racine de rétention chez la SOURCE. Le pointeur se résout à chaque tir, et
//  le lien mort se retire de lui-même. C'est pour cela qu'idUnic vit sur TsiNode :
//  un dest peut être une Pièce, une Face, demain une piste — le pointeur porte sa
//  table, le listener n'a pas à savoir.
//  UN ÉCOUTEUR DU DOM posé par un composant Tispi (PD 06/10) — il garde cible, nom et fonction : de quoi se DÉCROCHER.
//  ≠ TsiListener (ci-dessous) : celui-là est un abonnement à un événement TISPI ($on). Le composant porteur déclare
//  `domListeners = null` dans son constructeur ; le balayage le trouve, le stop/la suppression appelle removeAll.
class TsiDomListener {
  constructor(target, eventName, callback) {
    this.target = target; this.eventName = eventName; this.callback = callback;
    target.addEventListener(eventName, callback);
  }
  remove() { this.target.removeEventListener(this.eventName, this.callback); }
  static add(component, target, eventName, callback) {
    (component.domListeners ??= []).push(new TsiDomListener(target, eventName, callback));
  }
  static removeAll(component) {
    for (const l of component.domListeners ?? []) l.remove();
    component.domListeners = null;
  }
}

//  LE CURSEUR À LECTURE AUTONOME (PD 06/10) — un élément qui PARLE MÉDIA : currentTime (s), duration,
//  paused, ended, play(), pause(), et les événements play/pause/seeking/seeked/ended. Pour
//  TsiMediaClockMasterService il est indistinguable d'un <video>. Il avance seul sur play()
//  (requestAnimationFrame) ; glissé à la main, il émet seeking puis seeked, comme un film qu'on
//  rembobine. Il ne connaît pas Tispi : la cadence lui est PASSÉE (format 1).
//  PAS une balise (S-1, PD 11/10) : un objet qui PILOTE un <input type="range"> de la Face — écrit dans la
//  page (son style sur lui) ou créé par &sliderSynchro ; l'arbre reste celui de la page. Échelle de l'input =
//  les SECONDES (min 0, max = durée). L'input porte ses réglages : max, value, data-loop, data-autoplay —
//  ils priment sur les paramètres de la piste.
class TsiSlider extends EventTarget {
  constructor(input, duration, loop) {
    super();
    this.input = input;
    input.type = 'range'; input.min = 0; input.step = 'any';
    this.duration = +input.max || duration;  input.max = this.duration;
    this.loop     = 'loop' in input.dataset || loop;
    this.autoplay = 'autoplay' in input.dataset;
    this.paused = true; this.ended = false;
    this._time = +input.getAttribute('value') || 0; this._base = 0; this._t0 = 0; this._raf = null; this._wasPlaying = false;
    this._paint();
    input.addEventListener('pointerdown', () => { this._wasPlaying = !this.paused; this.pause(); });
    input.addEventListener('input',  () => {
      this._time = this._base = +input.value; this._t0 = performance.now();
      this.dispatchEvent(new Event('seeking'));
    });
    input.addEventListener('change', () => { this.dispatchEvent(new Event('seeked')); if (this._wasPlaying) this.play(); });
  }

  //  VIVANT entre deux frames, comme celui d'une vidéo : lu avant le premier tick, il dit déjà le temps écoulé.
  get currentTime() { return this.paused ? this._time : Math.min(this.duration, this._base + (performance.now() - this._t0) / 1000); }
  set currentTime(s) {
    this._time = Math.max(0, Math.min(s, this.duration)); this.ended = false;
    this._base = this._time; this._t0 = performance.now(); this._paint();
    this.dispatchEvent(new Event('seeking')); this.dispatchEvent(new Event('seeked'));
  }

  play() {
    if (!this.paused) return;
    if (this.ended) this._time = 0;
    this.paused = false; this.ended = false;
    this._base = this._time; this._t0 = performance.now();
    this.dispatchEvent(new Event('play'));
    this._raf = requestAnimationFrame(this._tick);
  }
  pause() {
    if (this.paused) return;
    cancelAnimationFrame(this._raf);
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }

  _tick = (now) => {
    this._time = this._base + (now - this._t0) / 1000;
    if (this._time >= this.duration) {
      if (!this.loop) {                                     // bout de course : arrêt, comme un film
        this._time = this.duration; this._paint();
        this.paused = true; this.ended = true;
        this.dispatchEvent(new Event('ended'));
        return;
      }
      this._time = 0; this._base = 0; this._t0 = now;       // boucle : un seeked, les esclaves repartent de 0
      this.dispatchEvent(new Event('seeked'));
    }
    this._paint();
    this._raf = requestAnimationFrame(this._tick);
  };
  _paint() { this.input.value = this._time; }

  //  Les COMMANDES (PD 06/10) : N en secondes ; format 1 = N en frames, paramFormat = durée d'une frame en ms.
  _seconds(n, format, paramFormat) { return format === 1 ? n * paramFormat / 1000 : n; }
  gotoAndPlayValue(n, format, paramFormat) { this.currentTime = this._seconds(n, format, paramFormat); this.play(); }
  gotoAndStopValue(n, format, paramFormat) { this.pause(); this.currentTime = this._seconds(n, format, paramFormat); }
}
//  (customElements.define('tsi-slider') RETIRÉ le 2026-10-11, S-1 : plus de balise.)

class TsiListener {
  //  `repere` — l'idUnic de la TsiJs qui a posé cet abonnement (le bloc
  //  `{ on(…) }`). Avec le nom de l'événement, il forme le SIGNAL DISTINCTIF :
  //  il dit si un `on(…)` qui survient est LE MÊME que celui déjà en place.
  constructor(dest, action, repere) { this.dest = dest.idUnic; this.action = action; this.repere = repere; }
  //  `action` est une FONCTION JavaScript ordinaire — celle que l'auteur a écrite
  //  dans son bloc : `$on('drag', (_ctx_) => …)`. On l'appelle avec le ctx du
  //  SENDER, et c'est L'AUTEUR qui décide s'il le reçoit :
  //      (_ctx_) => …   le paramètre masque le capturé ⇒ contexte du SENDER
  //      ()      => …   rien ne masque ⇒ le _ctx_ du bloc, celui de L'ABONNÉ
  //  Le moteur n'arbitre pas : la portée JavaScript le fait déjà.
  //  `onStale` remonte au contenant, seul à savoir retirer CET abonné.
  send(ctx, onStale) { if (this.dest.get(onStale)) this.action?.(ctx); }
}

//  LES ABONNÉS D'UN ÉVÉNEMENT — Map clé = le POINTEUR du dest (TsiIdUnic).
//  La clé DIT la règle : UN dest, UN abonnement par événement. Et l'ordre d'abonnement
//  reste l'ordre de tir — une Map JavaScript itère dans l'ordre d'insertion, c'est
//  garanti par le langage. Accès direct : ni `find` ni `findIndex` à chaque appel,
//  alors que `add` se rejoue à chaque passage sur la frame.
class TsiListeners extends Map {
  //  LE REPÈRE décide du sort d'un abonnement déjà en place : `&onTime 0:{ on(…) }`
  //  se rejoue à CHAQUE passage sur la frame 0 (boucle, gotoStop, rejeu).
  //  Repère CONCORDANT ⇒ c'est le même appel qui revient, on ne touche à RIEN : le
  //  callback en place peut être EN TRAIN DE TOURNER (un geste commencé, une
  //  animation lancée), le remplacer le réinitialiserait.
  //  Repère DIFFÉRENT ⇒ c'est un autre appel, il prend la place.
  add(dest, action, repere) {
    const listener = this.get(dest.idUnic);
    if (listener) {
      if (listener.repere !== repere) { listener.action = action; listener.repere = repere; }
      return this;
    }
    this.set(dest.idUnic, new TsiListener(dest, action, repere));
    return this;
  }
  suppr(dest) { return this.delete(dest.idUnic); }

  //  L'ORDRE D'ABONNEMENT EST L'ORDRE DE TIR. Les abonnés morts (dest flushé) sont
  //  RÉCOLTÉS puis retirés APRÈS la boucle : supprimer d'une Map pendant qu'on
  //  l'itère est licite en JS, mais on garde la récolte — elle dit l'intention et
  //  ne dépend pas de cette subtilité.
  send(ctx) {
    let morts = null;
    for (const [cle, listener] of this) listener.send(ctx, () => (morts ??= []).push(cle));
    if (morts) for (const cle of morts) this.delete(cle);
  }
}

//  LA TABLE DES ÉVÉNEMENTS d'un nœud — un TsiNode en porte une (this.events).
class TsiEvents extends Map {
  //  Le SIGNAL DISTINCTIF est le COUPLE (repère, nom d'événement) : le nom range
  //  dans SA liste, le repère y reconnaît l'abonnement. Les deux doivent concorder.
  add(eventName, dest, action, repere) {
    let listeners = this.get(eventName);
    if (!listeners) this.set(eventName, listeners = new TsiListeners());
    return listeners.add(dest, action, repere);
  }
  suppr(eventName, dest) { return this.get(eventName)?.suppr(dest) ?? false; }
  send(eventName, ctx)   { this.get(eventName)?.send(ctx); }
}


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiParser.js  (1920 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// tispi_parser.js
// Dépendance : tispi_core.js, tispi_css.js

/*
Codage :
1 - lettre a-z A-Z # $ & _ (souligné) — & : marqueur de piste/propriété (&face, &sz)
2 - chiffre 0-9
3 - signe : []<>:;,.
4 - opérateur +- * /
5 - block { } ( )
6 - " ' `quote
0 - escape -autre
*/

// Table de catégories ASCII pour le début et le corps d'un token (hors nom d'identifiant).
// Indexée par code ASCII (0-127). Catégorie 0 = ignoré / séparateur.
const StiCharCode = [
//  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //   0  ctrl
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //  16  ctrl
    0,   3,   6,   1,   1,   4,   1,   6,   5,   5,   4,   4,   3,   4,   3,   4,  //  32  spc ! " # $ % & ' ( ) * + , - . /
    2,   2,   2,   2,   2,   2,   2,   2,   2,   2,   3,   3,   3,   3,   3,   0,  //  48  0-9 : ; < = > ?   ('=' promu : affectation/déclaration de variable)
    3,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  64  @ A-O   ('@' promu : marque de PARAMÈTRE dans un bloc ~<…>)
    1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   3,   0,   3,   0,   1,  //  80  P-Z [ \ ] ^ _
    6,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  96  ` a-o
    1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   5,   4,   5,   3,   0,  // 112  p-z { | } ~ DEL   ('~' promu : ouvre `~<`, instructions d'ÉDITION)
];

const CSS_UNITS = new Set([
  'px', '%',
  'em', 'rem', 'ex', 'rex', 'cap', 'rcap', 'ch', 'rch', 'ic', 'ric', 'lh', 'rlh',
  'vw', 'vh', 'vi', 'vb', 'vmin', 'vmax',
  'svw', 'svh', 'svi', 'svb', 'svmin', 'svmax',
  'lvw', 'lvh', 'lvi', 'lvb', 'lvmin', 'lvmax',
  'dvw', 'dvh', 'dvi', 'dvb', 'dvmin', 'dvmax',
  'cm', 'mm', 'q', 'in', 'pt', 'pc',
  'deg', 'grad', 'rad', 'turn',
  's', 'ms',
  'hz', 'khz',
  'dpi', 'dpcm', 'dppx', 'x',
  'fr'
]);

// Table de catégories ASCII pour le corps d'un identifiant.
// Identique à StiCharCode sauf que les chiffres (0-9) sont en catégorie 1
// pour être autorisés à l'intérieur d'un nom (ex: rect0, im1).
const StiCharName = [
//  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //   0  ctrl
    0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //  16  ctrl
    0,   0,   6,   1,   1,   4,   1,   6,   5,   5,   4,   4,   3,   4,   3,   4,  //  32  spc ! " # $ % & ' ( ) * + , - . /
    1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   3,   3,   3,   3,   3,   0,  //  48  0-9 : ; < = > ?   ('=' promu, cf. table de début)
    3,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  64  @ A-O   ('@' promu, cf. table de début)
    1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   3,   0,   3,   0,   1,  //  80  P-Z [ \ ] ^ _
    6,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  96  ` a-o
    1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   5,   4,   5,   3,   0,  // 112  p-z { | } ~ DEL   ('~' promu, cf. table de début)
];

// Offset d'un pcOffset (après le '%') : '+' seul → null (composante neutre) ;
// sinon nombre signé/décimal. Renvoie [valeur, indexSuivant].
function readPcOffset(str, i) {
  if (str[i] === '+') return [null, i + 1];                        // marqueur null
  if (str[i] === '$') {                                            // variable $name → stockée '$name' (→ var(--name) à l'émission)
    let v = '';
    while (i < str.length && StiCharName[str.charCodeAt(i)] === 1) v += str[i++];
    return [v, i];
  }
  let v = '';                                                      // nombre signé/décimal
  if (str[i] === '-') v += str[i++];
  while (i < str.length && StiCharCode[str.charCodeAt(i)] === 2) v += str[i++];
  if (str[i] === '.') { v += str[i++]; while (i < str.length && StiCharCode[str.charCodeAt(i)] === 2) v += str[i++]; }
  return [Number(v), i];
}

// ═════════════════════════════════════════════════════════════
//  TOKENIZER
// ═════════════════════════════════════════════════════════════

/**
 * Tokenise une chaîne DSL en un tableau de tokens, puis fournit
 * un curseur de lecture (peek / next / nextPeek / peekNext)
 * ainsi que des helpers de parsing (parseArray, parsePath).
 *
 * Types de tokens produits :
 *   { type:'punct',  val: string }   — ponctuation []<>:;,.
 *   { type:'block',  val: string }   — blocs (){}
 *   { type:'string', val: string }   — chaîne entre quotes
 *   { type:'ident',  val: string }   — identifiant a-z A-Z _ # 0-9
 *   { type:'var',    val: string }   — variable '$nom' (les paramètres de module en sont)
 *   { type:'attr',   val: string }   — attribut de Pièce/Face '$$nom'
 *   { type:'number', val: number }   — entier ou décimal, éventuellement négatif
 *   { type:'mark',   val: string, closing } — balise de paramètre <*|nom*> (closing : '/' devant le nom)
 *
 * Sentinelle de fin : StiTokenizer.END (string "END").
 */
class TsiTokenizer {
  /** Sentinelle retournée quand le flux est épuisé et endExpected=true. */
  static END = "END";

  /** Garde anti-cycle du splice : nombre MAX d'incrustations. Une expansion légitime est bornée ;
   *  un cycle en fait un nombre non borné → trippe (O(1), indépendant de la vitesse de croissance). */
  static MAX_SPLICES = 100_000;

  // Contexte source — permet de localiser une erreur dans le HTML (n° de ligne du
  // fichier, pas du data-tsi). Posé par TsiCompiler.compile(el) pendant la compilation.
  static _srcCtx   = null;   // { el } : élément <tsi-…> en cours de compilation
  static _htmlCache = null;  // source HTML de la page (lecture UNIQUE, paresseuse, sur erreur)

  /** Chemin DOM « <body> › … › <el> » jusqu'à l'élément — lève l'ambiguïté d'ids dupliqués. */
  static _elPath(el) {
    try {
      const seg = n => `<${n.tagName.toLowerCase()}${n.id ? ' id="' + n.id + '"' : ''}>`;
      const chain = [];
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        chain.unshift(seg(n));
        if (n === document.body) break;        // racine = <body>
      }
      return chain.join(' › ');
    } catch { return el?.tagName ? `<${el.tagName.toLowerCase()}>` : ''; }
  }

  /** Source HTML de la page — paresseux, chemin d'ERREUR. Un échec/vide n'est PAS
   *  mémorisé (cache seulement le non-vide) → retentable plus tard (DOMContentLoaded
   *  où le XHR synchrone redevient fiable ; sur file:// il restera bloqué). */
  static _htmlSrc() {
    if (!TsiTokenizer._htmlCache) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', location.href, false);
        xhr.send();
        TsiTokenizer._htmlCache = xhr.responseText || null;
      } catch { TsiTokenizer._htmlCache = null; }
    }
    return TsiTokenizer._htmlCache || '';
  }

  /** Prochaine balise ouvrante `<tag …>` à partir de `from`, portant `id` si fourni. */
  static _findOpenTag(src, from, tag, id) {
    const open = '<' + tag;
    for (let i = src.indexOf(open, from); i >= 0; i = src.indexOf(open, i + 1)) {
      const c = src[i + open.length];
      if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r' && c !== '>' && c !== '/') continue;  // frontière de balise
      if (!id) return i;
      const end  = src.indexOf('>', i);
      const head = src.slice(i, end < 0 ? src.length : end);
      if (head.includes('id="' + id + '"') || head.includes("id='" + id + "'")) return i;
    }
    return -1;
  }

  /**
   * Ligne (1-based) du fichier HTML de l'élément `el` — via son CHEMIN depuis <body> :
   *   1. ANCÊTRES : on retrouve chaque balise ouvrante id-typée DANS L'ORDRE → on se
   *      positionne dans le bon sous-arbre (lève l'ambiguïté d'imbrication).
   *   2. FEUILLE : sa valeur data-tsi (unique) APRÈS cette position → la bonne occurrence
   *      même entre frères de même id (et insensible au '>' des transitions <…>).
   * Replis : balise ouvrante de la feuille, puis position globale de la valeur data-tsi.
   */
  static _htmlLineOf(el) {
    const src = TsiTokenizer._htmlSrc();
    if (!src || !el) return null;
    const lineAt = idx => src.slice(0, idx).split('\n').length;
    const tsi = el.dataset?.tsi || null;
    try {
      const anc = [];
      for (let n = el.parentElement; n && n.nodeType === 1; n = n.parentElement) {
        anc.unshift({ tag: n.tagName.toLowerCase(), id: n.id || null });
        if (n === document.body) break;
      }
      let at = 0;
      for (const s of anc) {                              // 1 — narrowing par les ancêtres
        const i = TsiTokenizer._findOpenTag(src, at, s.tag, s.id);
        if (i < 0) { at = -1; break; }
        at = i + 1;
      }
      if (at >= 0 && tsi) {                               // 2 — feuille par sa data-tsi
        const j = src.indexOf(tsi, at);
        if (j >= 0) return lineAt(j);
      }
      if (at >= 0) {                                      // repli : balise ouvrante de la feuille
        const k = TsiTokenizer._findOpenTag(src, at, el.tagName.toLowerCase(), el.id || null);
        if (k >= 0) return lineAt(k);
      }
    } catch { /* repli global ci-dessous */ }
    const j = tsi ? src.indexOf(tsi) : -1;                // repli : data-tsi global
    return j < 0 ? null : lineAt(j);
  }
  splice(pos, nbSuppr, srcInsert) {
    srcInsert = ' '+ srcInsert + ' '; // On ajoute un espace avant et après le srcInsert pour éviter les collisions de tokens
    const macroTokenizer = new TsiTokenizer(srcInsert);

    // injecter les tokens du macroTokenizer dans le tokenizer courant
    if(macroTokenizer.tokens[macroTokenizer.tokens.length - 1] === TsiTokenizer.END) macroTokenizer.tokens.pop(); // On enlève le token END du macroTokenizer
    this._splice(pos, nbSuppr, srcInsert, ...macroTokenizer.tokens); // On injecte le src + les tokens de la macro

  }
  /**
   * Splice COHÉRENT : maintient le tableau de tokens, le `src`, et les positions.
   * Deux espaces de coordonnées : `pos` = CARACTÈRES (dans src) · `posPair` = INDEX (dans tokens).
   * @param {number} pos       — index de token où insérer/remplacer
   * @param {number} nbSuppr   — nombre de tokens à supprimer
   * @param {string} srcInsert — texte source des tokens insérés (leurs pos/posPair sont LOCAUX à srcInsert)
   * @param  {...any} tokens   — tokens à insérer à la position `pos`
   */
  _splice(pos, nbSuppr, srcInsert, ...tokens) {
    // — CAPTURE (avant toute mutation) —
    const posChar     = this.tokens[pos]?.pos ?? this.str.length;            // position caractère de l'insertion
    const afterChar   = this.tokens[pos + nbSuppr]?.pos ?? this.str.length;  // début du 1er suivant = fin du supprimé
    const nbCharSuppr = afterChar - posChar;
    const deltaChar   = srcInsert.length - nbCharSuppr;                      // décalage CARACTÈRE des suivants
    const nbTokIns    = tokens.length;
    const deltaTok    = nbTokIns - nbSuppr;                                  // décalage INDEX des suivants

    // — 1. src (string) —
    this.str = this.str.slice(0, posChar) + srcInsert + this.str.slice(afterChar);
    if (++this._spliceCount > TsiTokenizer.MAX_SPLICES)                          // garde anti-cycle de macro (O(1))
      throw new Error(`StiTokenizer : > ${TsiTokenizer.MAX_SPLICES} incrustations — cycle de macro probable`);

    // — 2 + 4. tokens INSÉRÉS : rebase pos (caractère) et posPair (index) —
    for (const t of tokens) {
      t.pos += posChar;                             // #2 (caractère)
      if (t.posPair != null) t.posPair += pos;      // #4 (index : ils atterrissent à partir de `pos`)
    }

    // — splice du tableau —
    this.tokens.splice(pos, nbSuppr, ...tokens);
    this.length = this.tokens.length;

    // — 3 + 5. tokens SUIVANTS : déplacer pos (caractère) et posPair (index) —
    for (let i = pos + nbTokIns; i < this.length; i++) {
      const t = this.tokens[i];
      t.pos += deltaChar;                           // #3 (caractère)
      if (t.posPair != null) {                      // #5 (t.posPair contient encore l'ANCIEN index)
        if (t.posPair >= pos + nbSuppr)             //   paire AUSSI après → elle a bougé
          t.posPair += deltaTok;
        else                                        //   paire AVANT → closer straddling :
          this.tokens[t.posPair].posPair += deltaTok; //   le sien inchangé, l'opener immobile suit le closer
      }
    }
  }
  /**
   * Tokenise str et initialise le curseur en position 0.
   * @param {string} str — source DSL à analyser
   */
  constructor(str) {
    this.str = str;
    this._spliceCount = 0;        // garde anti-cycle du splice (cf. _splice)
    this.current = 0;
    this.tokens = [];
    let i = 0;

    while (i < str.length) {
      const ascii = str.charCodeAt(i);
      const cat   = StiCharCode[ascii];
      const start = i;                                 // index source du 1er car. du token

      switch (cat) {

        case 0:                                        // espace, inconnu → ignorer
          i++; break;

        case 3:                                        // ponctuation []<>:;,.=
          // ':=' (déclaration de variable) → UN token.
          if (str[i] === ':' && str[i + 1] === '=') {
            this.tokens.push({ type: 'punct', val: ':=', pos: start });
            i += 2; break;
          }
          //  '::' — LA VALEUR NOMMÉE (PD 2026-08-27) : le séparateur est DOUBLE
          //  pour laisser le ':' nu à la frame des keys.
          if (str[i] === ':' && str[i + 1] === ':') {
            this.tokens.push({ type: 'punct', val: '::', pos: start });
            i += 2; break;
          }
          // Balise de paramètre `<*|nom*>` / fermante `<*/nom*>` → UN token
          // { type:'mark', val:nom, closing }. Grammaire UNIFORME des paires :
          // borne du monde + `|nom` ouvre, `/nom` ferme (comme <!--|nom--> et
          // /*|nom*/). Le tri-gramme <*| ne peut rien signifier d'autre.
          if (str[i] === '<' && str[i + 1] === '*') {
            i += 2;
            const sigil = str[i];
            const closing = sigil === '/';
            if (closing || sigil === '|') i++;
            let name = '';
            while (i < str.length && StiCharName[str.charCodeAt(i)] === 1) name += str[i++];
            if (!name || (!closing && sigil !== '|') || str[i] !== '*' || str[i + 1] !== '>')
              throw new Error(TsiTokenizer.posError(str, start, 'balise de paramètre : forme attendue <*|nom*> (fermante <*/nom*>)'));
            i += 2;
            this.tokens.push({ type: 'mark', val: name, closing, pos: start });   // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)
            break;
          }
          //  '@nom' — l'OPTION de la couche IA (PD 07/09) : le MÊME attribut que '$$nom',
          //  un seul registre, clé '$$' (PD : « on reste à $$ »). Le sigil est ÉCHANGÉ ici,
          //  en un seul point, jamais ôté ; l'export IA réémettra '@'. `@<` reste ponctuation
          //  (raccourci d'options `@<durée, maître>`, décision 27).
          if (str[i] === '@' && /[A-Za-z_]/.test(str[i + 1] ?? '')) {
            let name = '';
            i++;                                       // '@'
            while (i < str.length && StiCharName[str.charCodeAt(i)] === 1) name += str[i++];
            this.tokens.push({ type: 'attr', val: '$$' + name, pos: start });
            break;
          }
          //  '...' — l'INCRUSTATION d'une macro à l'usage, `...$grille` (PD 07/09) : UN token,
          //  même geste que '->'. Dans un bloc `{…}` le JavaScript `...args` ressort intact :
          //  buildScript recopie le source entre ses réécritures, il ne réémet pas les tokens.
          if (str[i] === '.' && str[i + 1] === '.' && str[i + 2] === '.') {
            this.tokens.push({ type: 'punct', val: '...', pos: start });
            i += 3; break;
          }
          this.tokens.push({ type: 'punct', val: str[i], pos: start });
          i++; break;

        case 5:                                        // bloc (){}
          this.tokens.push({ type: 'block', val: str[i], pos: start });
          i++; break;

        case 6: {                                      // chaîne "..." '...' `...`
          const quote = str[i++];
          let val = '';
          while (i < str.length) {
            //  `\` — l'ÉCHAPPEMENT (PD 09/09) : le caractère qui suit ne ferme pas la chaîne.
            //  Chaîne rendue en VALEUR ('…' "…") : le caractère seul entre dans val.
            //  Macro (`…`) : les DEUX caractères, tels quels — son texte est RELU par splice,
            //  il s'échappera à sa relecture ; le désescaper ici casserait la seconde lecture.
            if (str[i] === '\\' && i + 1 < str.length) {
              val += quote === '`' ? str[i] + str[i + 1] : str[i + 1];
              i += 2; continue;
            }
            if (str[i] === quote) {
              //  '' = une apostrophe DANS le texte (règle SQL, PD 07/09) — `''` seul reste la chaîne vide.
              //  Grammaire IA : le texte est toujours entre apostrophes, `@doc = 'fenêtre d''activation';`.
              if (quote === "'" && str[i + 1] === "'") { val += "'"; i += 2; continue; }
              break;
            }
            val += str[i++];
          }
          i++;
          this.tokens.push({ type: 'string', val, quote, pos: start });   // quote conservé : `…` = macro, "…"/'…' = string rejetée en valeur
          break;
        }

        case 1: {                                      // ident a-z A-Z _ $ — sigles $var / $$attr
          let val = '';
          while (i < str.length && StiCharName[str.charCodeAt(i)] === 1) val += str[i++];
          // pcOffset avec pc = VARIABLE : $x%offset → token [ '$x', offset ]
          if (val[0] === '$' && str[i] === '%' &&
              (str[i + 1] === '+' || str[i + 1] === '-' || str[i + 1] === '$' || StiCharCode[str.charCodeAt(i + 1)] === 2)) {
            i++;                                       // consomme '%'
            const [off, ni] = readPcOffset(str, i);
            i = ni;
            this.tokens.push({ type: 'pcOffset', val: [val, off], pos: start });
            break;
          }
          // '$nom' = variable, '$$nom' = attribut de Pièce/Face ('--' ABANDONNÉ :
          // deux opérateurs, collision permanente avec le moins unaire ; '$' est
          // un caractère de nom → un seul token, zéro ambiguïté).
          const type = val[0] !== '$' ? 'ident' : val[1] === '$' ? 'attr' : 'var';
          //  Un `$` doit être suivi d'un NOM. Cette erreur est aussi le garde-fou
          //  de la règle des gabarits : `${…}` n'est PAS lu (ouvrir les chaînes au
          //  tokenizer serait « tirer au canon sur une mouche », PD) — l'auteur
          //  écrit `` `p ` + $var + ` s` ``, qui est du JavaScript ordinaire.
          if (type !== 'ident' && !/^\$\$?[A-Za-z_]/.test(val))
            throw new Error(TsiTokenizer.posError(str, start,
              `'${val}' : nom attendu après le sigle $`
              + (val.startsWith('${') ? " — dans un gabarit, écrire `texte ` + $var + ` suite`" : '')));
          this.tokens.push({ type, val, pos: start });
          break;
        }

        case 4:                                        // opérateurs + * / % & | — à venir
          // ── COMMENTAIRES JavaScript — SAUTÉS ENTIÈREMENT ──────────────────
          //  Le DSL n'en a pas, mais un corps d'action en est plein : sans ce
          //  saut, `// $x` laisserait passer un token `var` qui serait traduit
          //  comme du Tispi (mesuré). Une chaîne, elle, est consommée d'un bloc
          //  par la catégorie 6 : un `//` DANS une chaîne n'arrive jamais ici.
          //  (Vérifié : aucun `//` ni `/*` dans les data-tsi du corpus.)
          if (str[i] === '/' && str[i + 1] === '/') {
            while (i < str.length && str[i] !== '\n') i++;
            break;
          }
          if (str[i] === '/' && str[i + 1] === '*') {
            i += 2;
            while (i < str.length && !(str[i] === '*' && str[i + 1] === '/')) i++;
            if (i >= str.length)
              throw new Error(TsiTokenizer.posError(str, start, "commentaire /* … */ non fermé"));
            i += 2;
            break;
          }
          // pcOffset commençant par '+' (pc neutre) : '+%' offset → [null, offset]
          if (str[i] === '+' && str[i + 1] === '%') {
            i += 2;                                     // consomme '+%'
            const [off, ni] = readPcOffset(str, i);
            i = ni;
            this.tokens.push({ type: 'pcOffset', val: [null, off], pos: start });
            break;
          }
          // Seul '-' suivi d'un chiffre est supporté (nombre négatif) ; tout autre
          // opérateur est CONSOMMÉ ET ABANDONNÉ, comme la catégorie 0 — ni throw, ni
          // token. Le scanner découpe, il ne juge pas : un opérateur ne signifie encore
          // rien pour le DSL, l'émettre en `punct` ne ferait que reporter le refus plus
          // loin. Et surtout il DOIT traverser sans broncher un corps `{ … }`, qui
          // n'est jamais lu dans les tokens mais prélevé dans `str` entre l'accolade
          // ouvrante et son `posPair` : le caractère disparaît du flux, il reste intact
          // dans la source. (Décision PD 2026-08-12 ; contrepartie : `1 + 2` écrit dans
          // une valeur DSL ne lève plus d'erreur — il donne deux nombres.)
          //  '->' — LA RELATION TISPI « vers la fille » (PD 2026-08-26) : UN token,
          //  comme ':='. Illégal en JavaScript (la lambda est '=>') : aucune collision
          //  possible avec du code d'auteur. Dans `i-->0`, le premier '-' (suivi de '-')
          //  est abandonné AVANT d'arriver ici — seul `->` collé produit le token.
          if (str[i] === '-' && str[i + 1] === '>') {
            this.tokens.push({ type: 'punct', val: '->', pos: start });
            i += 2; break;
          }
          if (str[i] !== '-' || StiCharCode[str.charCodeAt(i + 1)] !== 2) { i++; break; }
          // fall through → nombre négatif
        case 2: {                                      // nombre 0-9, avec unité CSS éventuelle
          let val = '';
          if (str[i] === '-') val += str[i++];

          while (i < str.length && StiCharCode[str.charCodeAt(i)] === 2)
            val += str[i++];

          if (str[i] === '.') {
            val += str[i++];
            while (i < str.length && StiCharCode[str.charCodeAt(i)] === 2)
              val += str[i++];
          }

          // pcOffset : nombre '%' offset → token élémentaire [pc, offset] (offset = '+' null | signé/décimal).
          // Sans offset derrière le '%' → pourcentage nu (comportement inchangé, plus bas).
          if (str[i] === '%' && (str[i + 1] === '+' || str[i + 1] === '-' || str[i + 1] === '$' || StiCharCode[str.charCodeAt(i + 1)] === 2)) {
            i++;                                                // consomme '%'
            const [off, ni] = readPcOffset(str, i);
            i = ni;
            this.tokens.push({ type: 'pcOffset', val: [Number(val), off], pos: start });
            break;
          }

          let unit = '';

          if (str[i] === '%') {
            unit = str[i++];
          } else {
            while (i < str.length && /[a-zA-Z]/.test(str[i]))
              unit += str[i++];
          }

          if (unit) {
            const unitKey = unit === '%' ? unit : unit.toLowerCase();
            if (!CSS_UNITS.has(unitKey))
              throw new Error(TsiTokenizer.posError(str, start, TsiLang.t('unitUnknown', { unit })));
            this.tokens.push({ type: 'string', val: val + unit, pos: start });
          } else {
            this.tokens.push({ type: 'number', val: Number(val), pos: start });
          }

          break;
        }

        default:
          i++;
      }
    }
    this.length = this.tokens.length;
    this._pairBrackets(str);
    this.init();
  }

  /** Appariement des brackets `()` `{}` `[]` : pose `posPair` (index croisé) sur chaque token de paire,
   *  et VALIDE l'équilibrage dès la tokenisation. `<` `>` EXCLUS (opérateurs). `'…'` viendra avec le
   *  chantier macro (son contenu sera tokenizé). Ensuite tout saut de bracket est O(1) :
   *  depuis un ouvrant `t`, `this.tokens[t.posPair]` = son fermant (et réciproquement). */
  _pairBrackets(str) {
    const OPEN = { '(': ')', '{': '}', '[': ']' };
    const stack = [];
    for (let k = 0; k < this.tokens.length; k++) {
      const t = this.tokens[k];
      if (t.type !== 'block' && t.type !== 'punct') continue;      // structurels seuls (jamais un contenu de string/ident)
      if (OPEN[t.val]) stack.push(k);                              // ouvrant → empile l'INDEX
      else if (t.val === ')' || t.val === '}' || t.val === ']') {  // fermant → dépile + croise
        const o = stack.pop();
        if (o === undefined)                    throw new Error(TsiTokenizer.posError(str, t.pos, `'${t.val}' sans ouvrant`));
        if (OPEN[this.tokens[o].val] !== t.val) throw new Error(TsiTokenizer.posError(str, t.pos, `'${t.val}' ne ferme pas '${this.tokens[o].val}'`));
        this.tokens[o].posPair = k;  t.posPair = o;
      }
    }
    if (stack.length) { const o = this.tokens[stack[stack.length - 1]]; throw new Error(TsiTokenizer.posError(str, o.pos, `'${o.val}' non fermé`)); }
  }

  /** Remet le curseur en position 0. */
  init() { this.current = 0; }

  /** Retourne la position courante du curseur. */
  getCurrent() { return this.current; }

  /**
   * Convertit un index source en { line, col } (1-based) dans `str`.
   * « ligne » = numéro de ligne DANS le data-tsi (utile s'il est multi-ligne).
   */
  static lineCol(str, pos) {
    let line = 1, col = 1;
    for (let k = 0; k < pos && k < str.length; k++) {
      if (str[k] === '\n') { line++; col = 1; } else col++;
    }
    return { line, col };
  }

  /**
   * Message d'erreur LOCALISÉ : « … (ligne L, col C) » + la ligne fautive
   * et un caret '^' sous le token. `pos` = index source conservé sur le token.
   */
  //  el : l'élément fautif — par défaut celui en compilation ; un site d'APRÈS la construction (init au start) le passe lui-même.
  //  Le CONTEXTE (PD 07/10) : deux lignes au-dessus, deux au-dessous, numérotées ; ▶ marque la ligne fautive, ^ la colonne.
  static posError(str, pos, msg, el = TsiTokenizer._srcCtx?.el) {
    const where = el ? `\n  ↳ ${TsiTokenizer._elPath(el)}` : '';
    if (pos == null) return `${TsiLang.prefix}${msg}${where}\n  ${str}`;
    const { line, col } = TsiTokenizer.lineCol(str, pos);
    // « ligne » = ligne du FICHIER HTML (n° du data-tsi dans le source + décalage interne).
    const base = el ? TsiTokenizer._htmlLineOf(el) : null;
    const at   = base != null
      ? TsiLang.t('posAt',    { line: base + (line - 1), col })  // ligne du FICHIER HTML connue
      : TsiLang.t('posInSpi', { line, col });                    // illisible → ligne INTERNE au data-tsi (utile si multi-ligne)
    const lines = str.split('\n');
    const num   = i => String(base != null ? base + i : i + 1);
    const width = num(Math.min(lines.length - 1, line + 1)).length;
    const out   = [];
    for (let i = Math.max(0, line - 3); i <= Math.min(lines.length - 1, line + 1); i++) {
      const mark = i === line - 1 ? '▶ ' : '  ';
      out.push(`  ${mark}${num(i).padStart(width)} | ${lines[i]}`);
      if (i === line - 1) out.push(`    ${' '.repeat(width)} | ${' '.repeat(Math.max(0, col - 1))}^`);
    }
    return `${TsiLang.prefix}${msg}  ${at}${where}\n${out.join('\n')}`;
  }
  /**
   * Lit le token courant sans avancer le curseur.
   * @param {boolean} endExpected — si true, retourne END en fin de flux ; sinon lève une erreur.
   * @returns token courant ou StiTokenizer.END
   */
  peek(endExpected = false) {
    if (this.current >= this.length) {
      if (!endExpected) throw new Error(TsiLang.prefix + TsiLang.t('endUnexpected') + "\n" + this.str);
      return TsiTokenizer.END;
    }
    return this.tokens[this.current];
  }

  /** Le jeton courant vaut-il `v` ? Sans consommer ; faux à la fin du flux (la sentinelle n'a pas de `val`).
   *  (E-1b, 29/09 — déménagée de TsiNodeBuilder._at : une question au tokenizer vit chez lui.) */
  at(v) { return this.peek(true).val === v; }
  /** Un jeton marque-t-il le DÉBUT d'une piste, `&prop` ? (E-1c, 29/09 — une seule maison : les jumelles de
   *  TsiCompiler et de TsiNodeBuilder sont retirées.) */
  static isAmp(tok) { return tok !== TsiTokenizer.END && typeof tok.val === 'string' && tok.val[0] === '&'; }

  /**
   * Consomme et retourne le token courant, puis avance le curseur.
   * Équivalent de current++ (post-incrément).
   * @param {boolean} endExpected
   * @returns token courant ou StiTokenizer.END
   */
  next(endExpected = false) {
    if (this.current >= this.length) {
      if (!endExpected) throw new Error(TsiLang.prefix + TsiLang.t('endUnexpected') + "\n" + this.str);
      return TsiTokenizer.END;
    }
    return this.tokens[this.current++];
  }

  /**
   * Avance le curseur sur le lexème suivant PUIS retourne ce token
   * (pré-incrément — symétrique de next() qui est post-incrément).
   * @param {boolean} endExpected
   * @returns nouveau token courant ou StiTokenizer.END
   */
  nextPeek(endExpected = false) {
    this.current++;
    if (this.current >= this.length) {
      this.current = this.length;
      if (!endExpected) throw new Error(TsiLang.prefix + TsiLang.t('endUnexpected') + "\n" + this.str);
      return TsiTokenizer.END;
    }
    return this.tokens[this.current];
  }

  /**
   * Lit le token suivant (current+1) sans avancer le curseur.
   * Permet un lookahead d'un token.
   * @param {boolean} endExpected
   * @returns token suivant ou StiTokenizer.END
   */
  peekNext(endExpected = false) {
    if (this.current + 1 >= this.length) {
      if (!endExpected) throw new Error(TsiLang.prefix + TsiLang.t('endUnexpected') + "\n" + this.str);
      return TsiTokenizer.END;
    }
    return this.tokens[this.current + 1];
  }


  /**
   * Lit le token à current+offset sans bouger le curseur.
   * Retourne "" si hors limites.
   * @param {number} offset
   * @returns token ou ""
   */
  peekOffset(offset) {
    return (this.current + offset >= this.length) ? "" : this.tokens[this.current + offset];
  }

  /**
   * Lit une liste délimitée de la forme : open item separ item ... close
   * Si open est null, démarre directement sans chercher de token d'ouverture.
   * Si open est défini mais absent, retourne null sans bouger le curseur.
   *
   * @param {string|null} open  — token d'ouverture (ex: '[') ou null
   * @param {string}      separ — séparateur (ex: ';' ou ',')
   * @param {string}      close — token de fermeture (ex: ']')
   * @param {function}    fcItem — fonction(tokenizer) appelée pour lire chaque élément
   * @returns {Array|null} tableau des éléments, ou null si open absent. Le signe de cloture n'est pas consommé
   */
  parsedArray(open, separ, close, fcItem) {
    if (open) {
      const o = this.peek(true);
      if (o === TsiTokenizer.END || o.val !== open) return null;  // ne bouge pas
      this.next(); // consomme l'ouverture
    }

    const items = [];

    while (true) {
      let tok = this.peek(true);
      if (tok === TsiTokenizer.END)
        throw new Error(`parseArray : '${close}' attendu`);
      if (tok.val === close) { break; }

      items.push(fcItem(this));

      tok = this.peek(true);
      if (tok === TsiTokenizer.END)
        throw new Error(`parseArray : '${close}' attendu`);
      if (tok.val === close) { break; }
      if (tok.val === separ) { this.next(); continue; }
      throw new Error(`parseArray : '${separ}' ou '${close}' attendu — reçu : ${tok.val}`);
    }

    return items;
  }


  /**
   * SAUTE dans le flux jusqu'au token dont la valeur est tokenValue : le curseur AVANCE (d'où le nom, PD 10/09 — c'était
   * `searchNext` ; la recherche immobile, au niveau 0, est `searchLevel`).
   * @param {string} tokenValue — valeur cherchée
   * @returns {number} index du token trouvé, ou -1 si non trouvé. Le token "trouvé" n'est pas consommé. 
   */
  jumpNext(tokenValue) {
    while (this.current < this.length) {
      if (this.nextPeek(true).val === tokenValue) return this.current;  // current = token trouvé
    }
    return -1;
  }
  /** L'index du premier token, entre `debut` et `fin`, dont la valeur est l'un des `signes` — ou qui satisfait la fonction
   *  donnée à leur place —, AU NIVEAU 0. Le curseur ne bouge pas. -1 si absent.
   *  L'INTÉRÊT DE posPair (PD 10/09) : un bloc apparié, `(…)` `{…}` `[…]`, est franchi d'UN SEUL SAUT, de son ouvrant à son
   *  fermant, quelle que soit sa taille et sa profondeur — sans lui, il faudrait lire chaque token du bloc en comptant les
   *  niveaux. Le niveau 0 est gratuit : c'est ce que _pairBrackets a payé une fois, à la tokenisation.
   *  (10/09 — remplace deux boucles en ligne : la fin d'une valeur dans l'aiguillage, les ',' ';' de buildScript.) */
  searchLevel(signes, debut = this.current, fin = this.length) {
    const ok = typeof signes === 'function' ? signes : (Array.isArray(signes) ? t => signes.includes(t.val) : t => t.val === signes);
    for (let j = debut; j < fin; ) {
      const t = this.tokens[j];
      if (ok(t)) return j;
      j = (t.posPair != null && t.posPair > j) ? t.posPair + 1 : j + 1;
    }
    return -1;
  }

  /**
   * Retourne une chaîne des valeurs des tokens de posStart à posEnd (exclu).
   * @param {number} posStart — index de début (défaut : 0)
   * @param {number} posEnd   — index de fin exclu (défaut : this.length)
   * @returns {string}
   */
  toString(posStart, posEnd) {
    if (posStart === undefined || posStart < 0) posStart = 0;
    if (posEnd   === undefined || posEnd > this.length) posEnd = this.length;
    let t = "";
    for (let i = posStart; i < posEnd; i++) {
      t += this.tokens[i].val + " ";
    }
    return t;
  }

  /**
   * Retourne une chaîne de debug avec un saut de ligne au token pos.
   * Formats :
   *   tokenizer.toDebug(100, 200, 250)  — tokens 100..250, saut en 200
   *   tokenizer.toDebug(100)            — tokens current-100..current+100, saut en current
   *   tokenizer.toDebug(100, 200)       — tokens 100..fin, saut en 200
   * @param {number} posStart
   * @param {number} [pos]
   * @param {number} [posEnd]
   * @returns {string}
   */
  toDebug(posStart, pos, posEnd) {
    if (pos === undefined) {
      posEnd   = this.current + posStart;
      pos      = this.current;
      posStart = this.current - posStart;
    }
    if (posStart < 0) posStart = 0;
    if (posEnd === undefined || posEnd > this.length) posEnd = this.length;
    let t = this.toString(posStart, pos);
    t += "\n =>";
    t += this.toString(pos, posEnd);
    return t;
  }
  /**
   * Franchit le séparateur entre deux éléments d'une liste.
   * À appeler APRÈS chaque élément lu.
   * @param {*}      value  — élément qui précède (réservé)
   * @param {string} closer — token de fermeture (NON consommé)
   * @param {string} separ  — séparateur (consommé)
   * @param {string} name   — nom de l'élément, pour le message d'erreur
   * @returns {boolean} true = continuer la lecture, false = closer atteint
   */
  jumpSepar(value, closer, separ, name) {
    const tok = this.peek(true);
    if (tok === TsiTokenizer.END || tok.val === closer) return false;
    if (this.next().val !== separ)
      throw new Error(`after "${name}", "${separ}" or "${closer}" expected\n` + this.toDebug(10));
    return true;
  }
}


// ═════════════════════════════════════════════════════════════
//  COMPILER  —  string DSL → tableaux moteur (TsiTimeline)
// ═════════════════════════════════════════════════════════════

/**
 * Compile une string DSL en tableaux de pistes consommables par TsiTimeline.
 *
 * Pur (string → tableaux) : aucune dépendance à o_/DOM. La validation
 * o_.css[prop] et la construction restent en aval (TsiTimeline/buildTrack).
 *
 * ── PHASE B1 — base, SANS crochets ────────────────────────────────
 *   &prop key ; key ; …          (keys jusqu'à la piste suivante '&' ou la fin)
 *   key  ::= frame ':' valeur? ';'   |   valeur ';'   (statique → frame 0)
 *
 *     scalaire (ident/number/string)  →  telle quelle
 *     tuple  v , v , …                 →  [v, v, …]
 *     vide   « 200: »                  →  terminal : borne (frame nue)
 *                                          non-terminal : frame, ""
 *     statique  « &sz 200,100 »        →  frame 0 injecté
 *   Les crochets sont proscrits (lisibilité). Un séparateur (espace ou ':')
 *   est requis entre &prop et la 1re key.
 *
 * ── PHASE B2 — transitions <…> ────────────────────────────────────
 *   <duration? accelerator? effect? delay?>   (parties optionnelles, ordre libre)
 *     duration / delay  : nombre SUIVI DE ':' (comme les frames) — 1re occurrence=durée, 2e=délai
 *     accelerator       : _l_ _e_ _in_ _out_ _io_ _c_(a,b,c,d)
 *                         → linear ease ease-in ease-out ease-in-out cubic-bezier(…)
 *     effect            : nom d'effet (ident) — ex. fade
 *   Position (norme '!') :
 *     <…>  bare après &prop  = transition d'ENTRÉE (-1)  → apparition
 *                              progressive de la 1re valeur (pseudo-key).
 *     !<…> après &prop       = transition de PISTE (-2)  → défaut des intervalles.
 *     <…>  après une valeur  = transition de KEY (-1).
 *   Le '!' lève l'ambiguïté entrée/piste (même position après &prop).
 *   Émission : ease-seule → string nue ; sinon → marqueur, [dur,ease,effect,delay].
 *   L'entrée est TOUJOURS émise [-1, [dur,ease,effect,delay]] (jamais string nue).
 *   (les `_x_` évitent '-'/':' bruts → neutralise le piège des easings WAAPI).
 *
 * ── PHASE B3 — section out ────────────────────────────────────────
 *   Mot-clé `out` en début de key : sépare les keys d'apparition des keys
 *   de sortie (frames de sortie relatives à 0). Émis tel quel dans le
 *   tableau ; `TsiFaceDom._splitPairs` (déjà là) fait la coupe in/out.
 *   N'a de sens que sur une FACE (plateau-de-face). Ex :
 *     &bgColor red; 60: blue; out white;  → [...,60,"blue","out",0,"white"]
 *   Pas encore : $variable / function_call (B4).
 */










































































































// ═════════════════════════════════════════════════════════════
//  TOKENIZER DE MODULES — la surcouche <balise> (PD 09/09)
// ═════════════════════════════════════════════════════════════
//  Lit le TEXTE d'une page (le fichier .html ou un fragment, jamais le DOM) et n'en relève que ce que
//  l'expansion des modules demande :
//   · les balises qui COMPTENT pour le module — celles dont le premier item de tête est `@module`, `@new` ou
//     `@nodeModule` (convention PD 09/09) — avec leurs QUATRE positions : début et fin de l'ouvrante, début et fin
//     de la fermante ; le remplacement ira de l'une à l'autre. Les autres balises sont oubliées ;
//   · dans la tête du data-tsi : l'option qui décide, puis, selon elle, les déclarations letModule / constModule /
//     cssModule d'un module ou les affectations `$nom = …;` d'une instance ; un slot ne livre que son nom.
//  Les valeurs sont PARCOURUES (murs de quotes, blocs, commentaires), jamais tokenisées : on relève des positions,
//  on ne construit aucune chaîne en chemin. La lecture d'une tête s'arrête au premier '&'.
//  Un contexte = une fonction = ses tables : DOM (_enTete, _fermante), TSI (_tsi), VAR_NAME (corps de nom).
//  Hors balise, et le brut (<!-- -->, <script>, <style>), vont par indexOf.
//  DEUX PILES, deux rôles (PD) : la pile d'APPARIEMENT porte toutes les balises ouvertes le temps du balayage, vérifie
//  la structure HTML strictement, et disparaît ; la pile de TRAITEMENT DE MODULE, `this.tokens`, ne reçoit que les
//  balises utiles, avec toute leur information, dans l'ordre du document.
//  Token (objet nu, comme ceux de la mère) :
//   { type:'tag', val, openPos, openEnd, closePos, closeEnd, tsi:{pos,end}, id:{pos,end}|null, role, name, option, items }
//        openPos / openEnd = le '<' et l'après-'>' de l'ouvrante ; closePos / closeEnd = idem pour la fermante
//        (= openEnd pour un vide) ; role : 'module' | 'new' | 'nodeModule' ; name = le mot après '=' du premier
//        item, nu ; option = le premier item ; items = [relevés] ou null.
//   Un relevé : { kind:'option'|'assign'|'declar', word?, name, pos, val, end } — pos = début de l'item, val = après
//        le '=', end = le ';' (ou le '&', ou la fin du data-tsi). Que des positions, aucune valeur copiée.
//  L'héritage ne prend RIEN à la lecture du DSL : TsiTokenizer n'est pas modifié, son constructeur est appelé sur du vide.
//  Ce qui est hérité et utile : le CURSEUR sur la liste de tokens (peek / next / nextPeek / peekNext / peekOffset /
//  jumpNext / searchLevel / init / getCurrent / toString / toDebug) et les erreurs localisées (posError, lineCol, _htmlLineOf).
class TsiTokenizerModule extends TsiTokenizer {

  // DOM — contextes _enTete / _fermante, et le caractère après '<' hors balise.
  //  0 sauté · 1 lettre _ · 2 chiffre · 6 quote d'attribut · 14 = · 15 < · 16 > · 17 / · 18 ! ?
  static DOM = [
  //  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //   0  ctrl
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //  16  ctrl
      0,  18,   6,   0,   0,   0,   0,   6,   0,   0,   0,   0,   0,   0,   0,  17,  //  32  spc ! " # $ % & ' ( ) * + , - . /
      2,   2,   2,   2,   2,   2,   2,   2,   2,   2,   0,   0,  15,  14,  16,  18,  //  48  0-9 : ; < = > ?
      0,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  64  @ A-O
      1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   0,   0,   0,   0,   1,  //  80  P-Z [ \ ] ^ _
      0,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  96  ` a-o
      1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   0,   0,   0,   0,   0,  // 112  p-z { | } ~ DEL
  ];
  // TSI — contexte data-tsi.
  //  0 sauté · 1 lettre _ · 2 chiffre · 4 / · 5 { } · 6 quote · 10 $ · 11 @ · 12 ; · 13 & · 14 = · 15 <
  static TSI = [
  //  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //   0  ctrl
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //  16  ctrl
      0,   0,   6,   0,  10,   0,  13,   6,   0,   0,   0,   0,   0,   0,   0,   4,  //  32  spc ! " # $ % & ' ( ) * + , - . /
      2,   2,   2,   2,   2,   2,   2,   2,   2,   2,   0,  12,  15,  14,   0,   0,  //  48  0-9 : ; < = > ?
     11,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  64  @ A-O
      1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   0,   0,   0,   0,   1,  //  80  P-Z [ \ ] ^ _
      6,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  96  ` a-o
      1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   5,   0,   5,   0,   0,  // 112  p-z { | } ~ DEL
  ];
  // VAR_NAME — corps d'un nom.  0 fin du nom · 1 lettre chiffre _ $ · 2 tiret (DOM seul : tsi-group, data-tsi)
  static VAR_NAME = [
  //  0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //   0  ctrl
      0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,   0,  //  16  ctrl
      0,   0,   0,   0,   1,   0,   0,   0,   0,   0,   0,   0,   0,   2,   0,   0,  //  32  spc ! " # $ % & ' ( ) * + , - . /
      1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   0,   0,   0,   0,   0,   0,  //  48  0-9 : ; < = > ?
      0,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  64  @ A-O
      1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   0,   0,   0,   0,   1,  //  80  P-Z [ \ ] ^ _
      0,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,  //  96  ` a-o
      1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   1,   0,   0,   0,   0,   0,  // 112  p-z { | } ~ DEL
  ];

  static VOID_TAGS   = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
  static RAW_TAGS   = new Set(['script', 'style']);
  static DECLARATIONS = new Set(['letModule', 'constModule', 'cssModule']);
  static ROLES   = { $$module: 'module', $$new: 'new', $$nodeModule: 'nodeModule' };
  static BARE_INSTANCE = "une instance ne porte que @new et ses paramètres — pour ajouter une variable, une macro ou une piste, dérivez un module";

  /** Le DÉVELOPPEMENT d'un texte (PD 09/09) : ses modules étendus en place, ses instances instanciées. Trois processus :
   *  1. le tokenizer mémorise les positions ; 2. les POINTEURS les reprennent (TsiBranchePt et ses héritiers) et le LIEN
   *  valide tout — module connu, paramètre déclaré, slot existant, cycle — rien ne peut plus échouer ensuite ;
   *  3. le BALAYAGE construit le string, par segments, sans jamais écrire dans un texte qui porte des positions.
   *  TODO (PD) : la MARQUE du développé — pour l'instant le contexte : la racine développée garde `@new = M;` ;
   *  TODO (PD) : une classe pour abriter le développement quand la réduction viendra. */
  static expand(str, opts = {})             { return TsiTokenizerModule._scene(str, opts).expand(); }
  /** La RÉDUCTION, l'inverse (PD 10/09) : le texte où chaque instance revient à sa forme `@new = M;` + paramètres + affectés.
   *  `mode` : 'all' (défaut) ou 'different'. */
  static reduce(str, mode = 'all', opts = {}) { return TsiTokenizerModule._scene(str, opts).reduce(mode); }
  /** Les pointeurs d'un texte, liés et validés. */
  static _scene(str, opts = {}) {
    const tk = new TsiTokenizerModule(str, opts), scene = new TsiScenePt(str);
    scene._fill(tk, 0);
    TsiTokenizerModule._link(scene);
    return scene;
  }

  /** Le LIEN : chaque instance, à toute profondeur, trouve son module et y vérifie ses paramètres et ses slots ; puis les
   *  cycles, par la descente module → ses instances → leurs modules. Toute faute est localisée dans le source. */
  static _link(scene) {
    for (const b of [scene, ...scene.modules.values()]) for (const inst of b.all()) inst._link(scene.modules);
    const state = new Map();                                              // module → 1 en cours de descente, 2 fini
    const descend = m => {
      if (state.get(m) === 2) return;
      if (state.get(m) === 1) throw new Error(TsiTokenizer.posError(m.text, m.start, `@module = ${m.name} : cycle — le module s'instancie dans sa propre descendance`));
      state.set(m, 1);
      for (const inst of m.all()) descend(inst.module);
      state.set(m, 2);
    };
    for (const m of scene.modules.values()) descend(m);
  }

  /** Le parent est initialisé sur du VIDE : sa boucle ne tourne pas, il ne produit aucun token, et son texte n'est PAS
   *  touché (PD 09/09 : « à quoi sert de programmer en Objet si on modifie le parent ? »). L'héritier lit ensuite avec
   *  SES fonctions de contexte, et hérite de ce qui l'intéresse : le CURSEUR et les erreurs localisées. */
  /** `reduced` : le texte est un RÉDUIT, celui de l'IA — une instance n'y porte que `@new` et ses paramètres ; une variable,
   *  une macro ou une piste dans une instance est une faute (PD 10/09 : « une instance ne s'étend pas, on dérive un module »).
   *  Faux par défaut : un DÉVELOPPÉ relu porte la tête entière du module, pistes comprises. */
  constructor(str, { reduced = false } = {}) {
    super('');
    this.str = str;
    this.reduced = reduced;
    this.tokenize(str);
    this.length = this.tokens.length;
  }

  /** La lecture, la sienne. Hors balise, seul '<' compte ; le caractère qui le suit aiguille. */
  tokenize(str) {
    const D = TsiTokenizerModule.DOM, stack = [];
    let i = 0;
    while ((i = str.indexOf('<', i)) >= 0) {
      switch (D[str.charCodeAt(i + 1)]) {
        case 1:  i = this._openTag(str, i, stack); break;
        case 17: i = this._closeTag(str, i, stack); break;
        case 18: i = this._raw(str, i); break;
        default: i++;                                              // un '<' de texte
      }
    }
    if (stack.length) { const o = stack.pop(); throw new Error(TsiTokenizer.posError(str, o.openPos, `<${o.val}> non fermé`)); }
  }

  /** Corps d'un nom par VAR_NAME ; `accept` = 1 (TSI) ou 3 (DOM, tiret compris). Rend l'index de fin. */
  _name(str, i, accept) {
    const V = TsiTokenizerModule.VAR_NAME;
    while (V[str.charCodeAt(i)] & accept) i++;
    return i;
  }

  /** Balise ouvrante : le tag, ses attributs ; la valeur de data-tsi est bornée puis lue par _tsi.
   *  Mémorisée dans `this.tokens` si elle compte pour le module ; empilée pour l'appariement dans tous les cas. */
  _openTag(str, i, stack) {
    const D = TsiTokenizerModule.DOM, openPos = i;
    i = this._name(str, i + 1, 3);
    const tok = { type: 'tag', val: str.slice(openPos + 1, i).toLowerCase(), openPos, openEnd: 0, closePos: 0, closeEnd: 0,
                  tsi: null, id: null, role: false, name: null, option: null, items: null };
    let attr = null, attrPos = 0, selfClosing = false;
    while (!tok.openEnd) {
      switch (D[str.charCodeAt(i)]) {
        case 1: { const a = i; i = this._name(str, i, 3); attr = str.slice(a, i).toLowerCase(); attrPos = a - 1; break; }   // un attribut
        case 14: {                                                 // '=' : sa valeur
          i++;
          while (str.charCodeAt(i) <= 32) i++;
          if (D[str.charCodeAt(i)] === 6) {                        // quotée : murée par SA quote, sans échappement (HTML)
            const b = str.indexOf(str[i], i + 1);
            if (b < 0) throw new Error(TsiTokenizer.posError(str, i, `attribut ${attr} : quote non fermée`));
            this._attribute(str, tok, attr, attrPos, i + 1, b);
            i = b + 1;
          } else while (str.charCodeAt(i) > 32 && str.charCodeAt(i) !== 62) i++;   // nue : jusqu'au séparateur ou '>'
          attr = null;
          break;
        }
        case 17: selfClosing = str.charCodeAt(i + 1) === 62; i++; break;  // '/>' : auto-fermante
        case 16: tok.openEnd = ++i; break;
        default:
          if (i >= str.length) throw new Error(TsiTokenizer.posError(str, openPos, `<${tok.val} : balise sans '>'`));
          i++;
      }
    }
    if (tok.tsi) { this._tsi(str, tok); this._afterHead(str, tok); }
    if (this._keeps(tok)) this.tokens.push(tok);              // la pile de traitement : ce que CE tokenizer garde (le module : les utiles seulement, PD)
    if (selfClosing || TsiTokenizerModule.VOID_TAGS.has(tok.val)) { tok.closePos = tok.closeEnd = tok.openEnd; return i; }   // fermante vide
    stack.push(tok);                                               // la pile d'appariement : toutes, le temps du balayage
    if (TsiTokenizerModule.RAW_TAGS.has(tok.val)) {                   // <script> <style> : brut jusqu'à SA fermante, en toute casse
      let j = i;
      for (;;) {
        j = str.indexOf('</', j);
        if (j < 0) throw new Error(TsiTokenizer.posError(str, openPos, `<${tok.val}> non fermé`));
        if (str.slice(j + 2, this._name(str, j + 2, 3)).toLowerCase() === tok.val) break;
        j += 2;
      }
      return this._closeTag(str, j, stack);
    }
    return i;
  }

  /** Un attribut relevé : `atStart` = l'espace devant son nom, [a, b) = sa valeur. Ici data-tsi et id ; un héritier ajoute les siens. */
  _attribute(str, tok, attr, atStart, a, b) {
    if (attr === 'data-tsi')  tok.tsi = { pos: a, end: b };
    else if (attr === 'id')   tok.id  = { pos: atStart, end: b + 1 };   // ` id="…"` entier : un couple de plages, ou une insertion
  }
  /** Après la tête d'un data-tsi : rien ici. Un héritier y relève ce que la tête ne lit pas — les pistes. */
  _afterHead(str, tok) {}
  /** Ce qui entre dans `this.tokens` : ici les balises utiles au module, rien d'autre (PD). */
  _keeps(tok) { return !!tok.role; }

  /** Balise fermante : dépile, apparie strictement ; ses deux positions vont sur l'ouvrante. Aucun token produit. */
  _closeTag(str, i, stack) {
    const closePos = i;
    i = this._name(str, i + 2, 3);
    const val = str.slice(closePos + 2, i).toLowerCase();
    i = str.indexOf('>', i);
    if (i < 0) throw new Error(TsiTokenizer.posError(str, closePos, `</${val} : balise sans '>'`));
    i++;
    const open = stack.pop();
    if (!open || open.val !== val)
      throw new Error(TsiTokenizer.posError(str, closePos, open ? `</${val}> ne ferme pas <${open.val}>` : `</${val}> sans ouvrante`));
    open.closePos = closePos; open.closeEnd = i;
    return i;
  }

  /** <!-- … -->, <!DOCTYPE …>, <?…> : sautés d'un bloc. */
  _raw(str, i) {
    const isComment = str.startsWith('<!--', i), end = isComment ? '-->' : '>';
    const j = str.indexOf(end, i + (isComment ? 4 : 2));
    if (j < 0) throw new Error(TsiTokenizer.posError(str, i, isComment ? 'commentaire <!-- non fermé' : "'<!' sans '>'"));
    return j + end.length;
  }

  /** La tête du data-tsi, bornée : item par item, jusqu'au premier '&' hors mur et hors bloc.
   *  Le premier item décide ; ensuite on ne garde que les déclarations *Module (module) ou les affectations (instance).
   *  Les blocs `{…}` sont comptés comme le tokenizer les apparie : quotes murées, commentaires sautés, tout le reste compte.
   *  Un `}` de trop se voit à l'instant ; un `{` jamais fermé se voit à la quote qui ferme l'attribut, une borne qu'aucun
   *  bloc ne peut franchir. */
  _tsi(str, tok) {
    const T = TsiTokenizerModule.TSI, end = tok.tsi.end;
    let i = tok.tsi.pos, depth = 0, opened = 0, item = null, atStart = true, first = true;
    while (i < end) {
      switch (T[str.charCodeAt(i)]) {
        case 6:  i = this._wall(str, i, end); break;
        case 4:  i = this._comment(str, i, end); break;
        case 5:                                                                  // '{' '}' : la profondeur
          if (str.charCodeAt(i) === 123) { if (depth === 0) opened = i; depth++; }
          else { if (depth === 0) throw new Error(TsiTokenizer.posError(str, i, "'}' sans ouvrant")); depth--; }
          i++; break;
        case 14: if (item && !item.val) item.val = i + 1; i++; break;           // '=' : la valeur commence
        case 15: i = depth ? i + 1 : this._chevron(str, i, end); break;          // `!<…>` de tête : sauté
        case 12:                                                                 // ';' : fin d'item
          if (depth) { i++; break; }
          this._endItem(str, tok, item, i, first);
          if (item) first = false;
          item = null; atStart = true; i++;
          if (tok.role !== 'module' && tok.role !== 'new') return;              // le premier item a décidé
          break;
        case 13:                                                                 // '&' : fin de tête
          if (depth) { i++; break; }
          if (this.reduced && tok.role === 'new') throw new Error(TsiTokenizer.posError(str, i, TsiTokenizerModule.BARE_INSTANCE));   // une piste dans une instance
          this._endItem(str, tok, item, i, first); return;
        case 10: case 11: case 1:                                                // début d'item : un nom
          if (str.charCodeAt(i) === 64 && str.charCodeAt(i + 1) === 60) { i = this._chevron(str, i + 1, end); break; }   // `@<…>`
          if (!atStart) { i++; break; }                                            // dans une valeur : rien à lire
          atStart = false;
          { const itemStart = i;
            [item, i] = this._item(str, i, end);
            if (this.reduced && tok.role === 'new' && (!item || item.kind === 'declaration'))   // une variable ou une macro dans une instance
              throw new Error(TsiTokenizer.posError(str, itemStart, TsiTokenizerModule.BARE_INSTANCE)); }
          break;
        default: i++;
      }
    }
    if (depth) throw new Error(TsiTokenizer.posError(str, opened, "'{' non fermé"));
    this._endItem(str, tok, item, end, first);                                 // une tête sans ';' final
  }

  /** Le début d'un item : `@nom` / `$$nom` option, `$nom` affectation, `letModule $nom` déclaration ; autre mot → null.
   *  Un sigle sans nom est une faute ; la règle et le message sont ceux du tokenizer. */
  _item(str, i, end) {
    const c = str.charCodeAt(i), pos = i;
    if (c === 64) {                                                              // '@nom' : le registre de '$$nom', comme le tokenizer
      if (!/[A-Za-z_]/.test(str[i + 1] ?? '')) throw new Error(TsiTokenizer.posError(str, i, "'@' : nom attendu après le sigle"));
      const j = this._name(str, i + 1, 1);
      return [{ kind: 'option', name: '$$' + str.slice(i + 1, j), pos, val: 0, end: 0 }, j];
    }
    const j = this._name(str, i, 1), name = str.slice(i, j);
    if (c === 36) {                                                              // '$$nom' option, '$nom' affectation
      if (!/^\$\$?[A-Za-z_]/.test(name)) throw new Error(TsiTokenizer.posError(str, i, `'${name}' : nom attendu après le sigle $`));
      return [{ kind: name.charCodeAt(1) === 36 ? 'option' : 'assign', name, pos, val: 0, end: 0 }, j];
    }
    if (!TsiTokenizerModule.DECLARATIONS.has(name)) return [null, j];                 // let / const / css / autre : rien à relever
    let k = j;                                                                   // letModule $nom
    while (k < end && str.charCodeAt(k) <= 32) k++;
    const m = this._name(str, k, 1), varName = str.slice(k, m);
    if (!/^\$[A-Za-z_]/.test(varName)) throw new Error(TsiTokenizer.posError(str, k, `${name} : nom de variable attendu ($nom)`));
    return [{ kind: 'declaration', word: name, name: varName, pos, val: 0, end: 0 }, m];
  }

  /** Fin d'un item (';', '&' ou fin de tête) : ses bornes, et ce qu'on en garde. `first` : le premier item de la tête. */
  _endItem(str, tok, item, i, first) {
    if (!item) return;
    item.end = i;
    if (first) {                                                               // le PREMIER item décide (convention PD 09/09)
      tok.role = (item.kind === 'option' && TsiTokenizerModule.ROLES[item.name]) || false;
      if (!tok.role) return;
      tok.option = item;                                                         // l'option elle-même, avec les positions de sa valeur
      const n = item.val ? str.slice(item.val, item.end).trim() : '', q = n.charCodeAt(0);
      tok.name = (q === 39 || q === 34) && n.charCodeAt(n.length - 1) === q ? n.slice(1, -1) : n;   // les noms s'écrivent nus : une quote de l'auteur est ôtée (PD)
      return;
    }
    if (tok.role === 'module' ? item.kind === 'declaration' : item.kind !== 'option') (tok.items ??= []).push(item);   // une instance garde AUSSI ses *Module : un développé relu garde ses valeurs
  }

  /** Chaîne quotée : jusqu'à la même quote ; `\` protège le caractère qui suit ; `''` = une apostrophe dans le texte. */
  _wall(str, i, end) {
    const q = str.charCodeAt(i++);
    while (i < end) {
      const c = str.charCodeAt(i);
      if (c === 92) { i += 2; continue; }
      if (c !== q) { i++; continue; }
      if (q === 39 && str.charCodeAt(i + 1) === 39) { i += 2; continue; }
      return i + 1;
    }
    return end;                                                                  // non fermée : jusqu'au bout, comme le tokenizer
  }

  /** `//` jusqu'à la fin de ligne, `/*` jusqu'à sa fermeture : sautés, comme le cas 4 du tokenizer. Un '/' seul : sauté. */
  _comment(str, i, end) {
    const c = str.charCodeAt(i + 1);
    if (c !== 47 && c !== 42) return i + 1;
    const j = str.indexOf(c === 47 ? '\n' : '*/', i + 2);
    return j < 0 ? end : Math.min(end, c === 47 ? j : j + 2);
  }

  /** `!<…>` / `@<…>` : le raccourci d'options, sauté jusqu'à son '>'. */
  _chevron(str, i, end) {
    const j = str.indexOf('>', i);
    return j < 0 ? end : Math.min(end, j + 1);
  }
}

// ═════════════════════════════════════════════════════════════
//  LES POINTEURS DU DÉVELOPPEMENT — 'Pt' = pointers (PD 09/09)
// ═════════════════════════════════════════════════════════════
//  Une branche = une plage d'un texte et ce que le développement en attend. TOUTES ses positions se rapportent à `text` :
//  le source pour la scène, une instance, un affecté, un module pas encore étendu ; sa copie pour un module étendu.
//  Une position ne se sépare jamais de son string. `srcStart` / `srcEnd` = la plage dans le SOURCE, qui ne change pas.
class TsiBranchPt {
  constructor(text, tok, start, end) {
    this.text = text;
    this.name  = tok?.name ?? null;                    // le nom du module : le sien, ou celui qu'on instancie
    this.tag   = tok?.val ?? null;                     // le nom de balise
    this.quote = tok?.tsi ? text[tok.tsi.pos - 1] : '"';   // la quote qui délimite son data-tsi
    this.start = this.srcStart = start;
    this.end   = this.srcEnd   = end;
    this.startId = this.endId = 0;                     // l'attribut ` id="…"` ; absent : une insertion après le nom de balise
    this.startOption = this.endOption = 0;             // le premier item de tête : `@module = M` ou `@new = M`
    this.params = new Map();                           // name → [startValue, endValue]
    this.slots  = new Map();                           // module : slotName → [start, end] ; instance : slotName → [affectés…]
    this.instances = [];                               // les instances du PREMIER NIVEAU de la plage
    if (tok) {
      if (tok.id) { this.startId = tok.id.pos; this.endId = tok.id.end; }
      else this.startId = this.endId = tok.openPos + 1 + tok.val.length;
      this.startOption = tok.option.pos; this.endOption = tok.option.end;
      for (const it of tok.items ?? []) this.params.set(it.name, [it.val, it.end]);
    }
  }

  /** Remplit la branche avec les balises utiles du premier niveau de sa plage, depuis l'index k de la liste, chacune
   *  absorbant sa propre branche ; rend l'index de la première balise hors de la plage. */
  _fill(tk, k) {
    const T = tk.tokens;
    while (k < T.length && T[k].openPos < this.end) {
      const t = T[k];
      k = t.role === 'module' ? this._module(tk, t, k) : t.role === 'new' ? this._instance(tk, t, k) : this._slot(tk, t, k);
    }
    return k;
  }
  _instance(tk, t, k) { const inst = new TsiModuleInstancePt(this.text, t); this.instances.push(inst); return inst._fill(tk, k + 1); }
  _module(tk, t)      { throw new Error(TsiTokenizer.posError(this.text, t.openPos, `@module = ${t.name} : un module se déclare au premier niveau, pas dans une branche`)); }
  _slot(tk, t)        { throw new Error(TsiTokenizer.posError(this.text, t.openPos, `@nodeModule = ${t.name} : aucun slot à combler ici, ni module ni instance`)); }

  /** Toutes les instances de la branche, à toute profondeur, sans entrer dans les modules qu'elles instancient. */
  *all() { for (const inst of this.instances) { yield inst; for (const l of inst.slots.values()) for (const a of l) yield* a.all(); } }

  /** Le texte de la plage, segment par segment, chaque instance du premier niveau remplacée par son instanciation. */
  expand() {
    let text = '', cur = this.start;
    for (const inst of this.instances) { text += this.text.slice(cur, inst.start) + inst.emit(); cur = inst.end; }
    return text + this.text.slice(cur, this.end);
  }

  /** Le texte de la plage, chaque instance du premier niveau remplacée par sa réduction. */
  reduce(mode) {
    let text = '', cur = this.start;
    for (const inst of this.instances) { text += this.text.slice(cur, inst.start) + inst.reduce(mode); cur = inst.end; }
    return text + this.text.slice(cur, this.end);
  }
}

//  La scène : tout le texte ; elle seule accepte les modules, au premier niveau, et les émet étendus, en place.
class TsiScenePt extends TsiBranchPt {
  constructor(text) { super(text, null, 0, text.length); this.modules = new Map(); }
  _module(tk, t, k) {
    if (this.modules.has(t.name)) throw new Error(TsiTokenizer.posError(this.text, t.openPos, `@module = ${t.name} : déclaré deux fois`));
    const m = new TsiModulePt(this.text, t); this.modules.set(t.name, m);
    return m._fill(tk, k + 1);
  }
  expand()  { return this._sweep(pt => pt.emit()); }
  reduce(mode) { return this._sweep(pt => pt.reduce(mode)); }
  /** Le balayage de la scène : modules et instances du premier niveau, dans l'ordre du texte, chacun émis par `emit`. */
  _sweep(emit) {
    const events = [...this.instances, ...this.modules.values()].sort((a, b) => a.srcStart - b.srcStart);
    let text = '', cur = 0;
    for (const pt of events) { text += this.text.slice(cur, pt.srcStart) + emit(pt); cur = pt.srcEnd; }
    return text + this.text.slice(cur, this.end);
  }
}

//  Un module : ses slots modèles, ses sous-instances ; il s'ÉTEND une fois.
class TsiModulePt extends TsiBranchPt {
  constructor(text, tok) { super(text, tok, tok.openPos, tok.closeEnd); this.extended = false; }
  _slot(tk, t, k) {
    if (this.slots.has(t.name)) throw new Error(TsiTokenizer.posError(this.text, t.openPos, `@nodeModule = ${t.name} : deux slots du même nom dans le module ${this.name}`));
    this.slots.set(t.name, [t.openPos, t.closeEnd]);
    return k + 1;                                      // le modèle n'absorbe rien : une instance dedans est une sous-instance du module
  }
  emit() { this.extend(); return this.text; }

  /** L'EXTENSION (PD) : la copie du module où chaque sous-instance est instanciée, en profondeur d'abord ; ses positions
   *  propres suivent, avec l'offset qui grandit à chaque insertion. Une position n'est jamais DANS une insertion. */
  extend() {
    if (this.extended) return;
    this.extended = true;
    const src = this.text, ins = [];                  // ins : [fin de l'insertion dans le source, offset en vigueur après]
    let text = '', cur = this.start, offset = -this.start;
    for (const inst of this.instances) {
      text += src.slice(cur, inst.start);
      const expanded = inst.emit();
      text += expanded;
      offset += expanded.length - (inst.end - inst.start);
      ins.push([inst.end, offset]);
      cur = inst.end;
    }
    text += src.slice(cur, this.end);
    const f = p => { let o = -this.start; for (const [end, after] of ins) { if (end <= p) o = after; else break; } return p + o; };
    this.startId = f(this.startId);         this.endId = f(this.endId);
    this.startOption = f(this.startOption); this.endOption = f(this.endOption);
    for (const v of this.params.values()) { v[0] = f(v[0]); v[1] = f(v[1]); }
    for (const v of this.slots.values())  { v[0] = f(v[0]); v[1] = f(v[1]); }
    this.text = text; this.start = 0; this.end = text.length; this.instances = [];
  }
}

//  Une instance : ses affectés, chacun une branche ; son module, résolu au lien ; elle s'INSTANCIE sur le module étendu.
class TsiModuleInstancePt extends TsiBranchPt {
  constructor(text, tok) { super(text, tok, tok.openPos, tok.closeEnd); this.module = null; }
  _slot(tk, t, k) {
    const assignee = new TsiBranchPt(this.text, null, t.openPos, t.closeEnd);
    if (!this.slots.has(t.name)) this.slots.set(t.name, []);
    this.slots.get(t.name).push(assignee);
    return assignee._fill(tk, k + 1);                // un affecté est une branche : il peut contenir des instances
  }
  _link(modules) {
    this.module = modules.get(this.name);
    if (!this.module) throw new Error(TsiTokenizer.posError(this.text, this.start, `@new = ${this.name} : module inconnu`));
    for (const [name, [s]] of this.params) if (!this.module.params.has(name))
      throw new Error(TsiTokenizer.posError(this.text, s, `${name} : le module ${this.name} ne déclare pas ce paramètre`));
    for (const [name, l] of this.slots) if (!this.module.slots.has(name))
      throw new Error(TsiTokenizer.posError(this.text, l[0].start, `@nodeModule = ${name} : le module ${this.name} n'a pas ce slot`));
  }
  emit() { return this.instantiate(); }

  /** La RÉDUCTION (PD 10/09), l'inverse du développement : la balise et son id, `@new = M;` et ses paramètres, ses seuls
   *  affectés, chacun réduit, un par ligne. `mode` : 'all' (défaut) réémet tout ; 'different' omet un paramètre égal au
   *  défaut du module et un affecté égal au modèle du slot. Le module n'est jamais étendu ici : ses positions sont celles du
   *  source. Propriété : développer(réduire(D)) = D ; la présentation humaine (blancs entre enfants, dans la tête) est la sienne. */
  reduce(mode = 'all') {
    const m = this.module, src = this.text, q = this.quote;
    let head = src.slice(this.startOption, this.endOption) + ';';
    for (const [name, [s, e]] of this.params) {
      const v = src.slice(s, e).trim();
      if (mode === 'different') { const [ms, me] = m.params.get(name); if (v === m.text.slice(ms, me).trim()) continue; }
      head += ` ${name} = ${v};`;
    }
    let body = '';
    for (const [name, assigned] of this.slots) {
      const [ms, me] = m.slots.get(name), model = m.text.slice(ms, me);
      for (const a of assigned) {
        if (mode === 'different' && src.slice(a.start, a.end) === model) continue;
        body += '\n' + a.reduce(mode);
      }
    }
    return `<${this.tag}${src.slice(this.startId, this.endId)} data-tsi=${q}${head}${q}>${body}${body && '\n'}</${this.tag}>`;
  }

  /** L'INSTANCIATION : le module étendu parcouru du début à la fin, les remplacements de CETTE instance à leur place,
   *  appariés ici, après l'extension, et triés par leur position dans le module — l'ordre du résultat est celui du module. */
  instantiate() {
    const m = this.module; m.extend();
    const events = [new TsiReplaceRange(m.startOption, m.endOption, this, this.startOption, this.endOption)];   // `@new = M` — TODO marque (PD)
    if (this.startId < this.endId) events.push(new TsiReplaceRange(m.startId, m.endId, this, this.startId, this.endId));   // sans id : celui du module reste
    for (const [name, [s, e]] of this.params) { const [ms, me] = m.params.get(name); events.push(new TsiReplaceRange(ms, me, this, s, e)); }
    for (const [name, assigned] of this.slots) { const [ms, me] = m.slots.get(name); events.push(new TsiReplaceSlot(ms, me, assigned)); }
    events.sort((a, b) => a.startModule - b.startModule);
    let text = '', cur = m.start;
    for (const e of events) { text += m.text.slice(cur, e.startModule) + e.text(); cur = e.endModule; }
    return text + m.text.slice(cur, m.end);
  }
}

//  Un remplacement : une plage du module, et ce qui s'émet à sa place. Deux gestes, deux classes.
class TsiReplacePt { constructor(startModule, endModule) { this.startModule = startModule; this.endModule = endModule; } }
class TsiReplaceRange extends TsiReplacePt {                       // l'id, l'option, un paramètre : une plage recopiée telle quelle
  constructor(sm, em, branch, start, end) { super(sm, em); this.branch = branch; this.start = start; this.end = end; }
  text() { return this.branch.text.slice(this.start, this.end); }
}
class TsiReplaceSlot extends TsiReplacePt {                        // un slot : ses affectés, listés, chacun développé
  constructor(sm, em, assigned) { super(sm, em); this.assigned = assigned; }
  text() { return this.assigned.map(a => a.expand()).join(''); }
}


// ⚠ CE N'EST PLUS UN COMPILATEUR — la compilation est passée à la CONSTRUCTION
//   DIRECTE (tispiBuild.js) : compile / compileText / buildAction ont disparu, et
//   _readTracksInto, _checkKnownProp/Func, _EASE_REVERSE, _EASE_CUBIC* ont été
//   retirés le 2026-08-09 (aucun appelant). Ce qui reste est une BOÎTE À OUTILS de
//   statics isolés, lue par le code neuf : _at / _isAmp / _valueRaw / _normText
//   par tispiVar.js (réification), _EASE par TsiTransition._resolveEase et par le
//   décompilateur. Le nom de la classe est un vestige.
// ═════════════════════════════════════════════════════════════
//  TOKENIZER DE LA COUCHE IA — le relevé de l'échange par rôle (PD 10/09 ; nommé le 11/09)
// ═════════════════════════════════════════════════════════════
//  Même balayage que le tokenizer de modules, autre mémoire : TOUS les nœuds qui portent un data-tsi, un style= ou un id —
//  la branche-réduite en a besoin pour projeter par rôle et fusionner par identité. Un nœud à data-tsi sans id est une
//  faute (PD : « tout nœud doit avoir un nom » — les Faces par &face, les Pièces par les paths).
//  Deux relevés de plus, positions brutes, rien de copié : les PISTES du data-tsi, de `&` en `&` à profondeur zéro, hors
//  mur, commentaire et chevron ; les PROPRIÉTÉS du style=, au `;` hors quotes et hors parenthèses (url(data:…;…)).
//  La tête est relevée entière (PD). Sur le token : tete {pos,end} · pistes [{name,pos,end}] · style {pos,end} ·
//  props [{name,pos,end}] · idVal, le nom du nœud. Le texte lu est celui du moteur : `!<…>` y passe encore, sans traduction.
class TsiTokenizerIa extends TsiTokenizerModule {
  _keeps(tok) {
    if (tok.tsi && !tok.id) throw new Error(TsiTokenizer.posError(this.str, tok.openPos, `<${tok.val}> : nœud sans id — tout nœud Tispi porte un nom`));
    return !!(tok.tsi || tok.style || tok.id);
  }
  _attribute(str, tok, attr, atStart, a, b) {
    if (attr === 'style') { tok.style = { pos: a, end: b, attr: atStart }; tok.props = this._props(str, a, b); return; }   // attr : le début de ` style=`, pour l'ôter entier
    super._attribute(str, tok, attr, atStart, a, b);
    if (attr === 'id') tok.idVal = str.slice(a, b);
    if (attr === 'data-tsi') tok.tsi.attr = atStart;
  }
  /** Après la tête : sa fin au premier '&' de piste, puis les pistes, de '&' en '&' ; la dernière va jusqu'à la fin. */
  _afterHead(str, tok) {
    const end = tok.tsi.end;
    let i = this._nextTrack(str, tok.tsi.pos, end);
    tok.head = { pos: tok.tsi.pos, end: i };
    tok.tracks = [];
    while (i < end) {
      const j = this._nextTrack(str, i + 1, end);
      tok.tracks.push({ name: str.slice(i, this._name(str, i + 1, 1)), pos: i, end: j });
      i = j;
    }
  }
  /** Le prochain '&' de piste — suivi d'une lettre, à profondeur zéro, hors mur, hors commentaire, hors chevron ; sinon `end`.
   *  Les accolades sont tenues comme dans _tsi : `}` sans ouvrant et `{` non fermé sont des fautes, pas des pistes avalées. */
  _nextTrack(str, i, end) {
    const T = TsiTokenizerModule.TSI;
    let depth = 0, opened = 0;
    while (i < end) {
      switch (T[str.charCodeAt(i)]) {
        case 6:  i = this._wall(str, i, end); break;
        case 4:  i = this._comment(str, i, end); break;
        case 5:
          if (str.charCodeAt(i) === 123) { if (depth === 0) opened = i; depth++; }
          else { if (depth === 0) throw new Error(TsiTokenizer.posError(str, i, "'}' sans ouvrant")); depth--; }
          i++; break;
        case 15: i = depth ? i + 1 : this._chevron(str, i, end); break;
        case 13: if (!depth && T[str.charCodeAt(i + 1)] === 1) return i; i++; break;
        default: i++;
      }
    }
    if (depth) throw new Error(TsiTokenizer.posError(str, opened, "'{' non fermé"));
    return end;
  }
  /** Les propriétés d'un style= : `nom: valeur`, séparées par ';' hors quotes et hors parenthèses. [pos, end) = une propriété, son ';' exclu. */
  _props(str, a, b) {
    const props = [];
    let i = a, atStart = a, par = 0;
    const closeProp = end => {
      let p = atStart; while (p < end && str.charCodeAt(p) <= 32) p++;
      const k = str.indexOf(':', p);
      if (k > p && k < end) props.push({ name: str.slice(p, k).trim(), pos: p, end: end });
    };
    while (i < b) {
      const c = str.charCodeAt(i);
      if (c === 34 || c === 39) { i = this._wall(str, i, b); continue; }
      if (c === 40) par++; else if (c === 41) par--; else if (c === 59 && !par) { closeProp(i); atStart = i + 1; }
      i++;
    }
    closeProp(b);
    return props;
  }
}

// ═════════════════════════════════════════════════════════════
//  LES RÔLES DE L'ÉCHANGE IA — ce que chaque rôle voit et écrit (PD 11/09)
// ═════════════════════════════════════════════════════════════
//  Quatre rôles : STRUCTUREL — l'arbre-en-cours et son temps (`&face`, `&stop`, la durée, la relation maître/esclave) ;
//  SÉMANTIQUE — le texte (`&text`, les nœuds texte de la cargaison), part avec le structurel, peut partir seul ; SPATIAL — la
//  géométrie et la mise en page ; DÉCORATIF — tout le reste, `&opacity` comprise (cacher un nœud = `&face` vers une face vide).
//  « Temporel n'est pas un rôle » : le temps est structurel, vu par tous. Une ACTION (`&onClick`…) se range par son CONTRAT
//  `@modifies` (PD 08/09 : « tout script indique ses modifications d'états ») — jamais par son code ; sans contrat, la
//  projection la refuse. `&button` suit son action. La tête est vue entière par tous ; écrite item par item : les options par
//  `writesOption`, une variable par le rôle des pistes qui la lisent (le filtre le sait). Les listes viennent du relevé des
//  pages (t11) ; le décoratif ne liste rien : il voit ce qu'aucun autre rôle ne nomme (`rest`).
class TsiIaRole {
  static ACTION  = /^&on[A-Z]/;                                       // une piste d'action : routée par le contrat de son script
  static FOLLOWERS = new Set(['&button']);                              // rangées par leurs ÉTATS : décoratif ; structurel aussi si un état ouvre une branche, `1:OVER_BRANCH` (PD 11/09)
  constructor(name, { tracks = [], writableTracks = tracks, props = [], writableProps = props, cargo = 'stub', options = [], byContract = [], rest = false } = {}) {
    this.name = name;
    this.tracks        = new Set(tracks);          // pistes vues, avec leur sigil
    this.writableTracks = new Set(writableTracks);
    this.props         = new Set(props);           // propriétés de style= vues
    this.writableProps  = new Set(writableProps);
    this.cargo     = cargo;                // 'stub' | 'text' | 'mark' | 'whole'
    this.options       = new Set(options);         // options de tête que le rôle ÉCRIT (toutes sont vues)
    this.byContract    = new Set(byContract);      // les mots de @modifies qui rattachent une action à ce rôle, en plus de ses pistes
    this.rest         = rest;                    // voit ce qu'aucun autre rôle ne nomme
  }
  /** Les autres rôles nomment-ils cette piste / propriété ? (le `rest` du décoratif) */
  _namedElsewhere(field, name) { return TsiIaRole.all.some(r => r !== this && r[field].has(name)); }
  /** Ce contrat rattache-t-il l'action au rôle ? Un mot = une piste du rôle (sans sigil) ou un verbe de `byContract` ; le
   *  décoratif prend les mots qu'aucun autre rôle ne réclame. Sans contrat : personne — la projection en fait une faute. */
  _byContract(contract) {
    if (!contract) return false;
    for (const word of contract) {
      if (this.byContract.has(word) || this.tracks.has('&' + word)) return true;
      if (this.rest && !TsiIaRole.all.some(r => r !== this && (r.byContract.has(word) || r.tracks.has('&' + word)))) return true;
    }
    return false;
  }
  seesTrack(name, contract = null) {
    if (TsiIaRole.ACTION.test(name) || (TsiIaRole.FOLLOWERS.has(name) && contract)) return this._byContract(contract);   // `&button` sans action : la règle ordinaire
    return this.tracks.has(name) || (this.rest && !this._namedElsewhere('tracks', name));
  }
  writesTrack(name, contract = null) {
    if (TsiIaRole.ACTION.test(name) || (TsiIaRole.FOLLOWERS.has(name) && contract)) return this._byContract(contract);
    return this.writableTracks.has(name) || (this.rest && !this._namedElsewhere('tracks', name));
  }
  seesProp(name)  { return this.props.has(name)        || (this.rest && !this._namedElsewhere('props', name)); }
  writesProp(name) { return this.writableProps.has(name) || (this.rest && !this._namedElsewhere('props', name)); }
  /** La tête est vue entière par tous (PD) ; une option ne s'écrit que par le rôle qui la porte. */
  writesOption(name) { return this.options.has(name); }

  /** Le CONTRAT d'un script : les mots de ses `@modifies`, lus en TOKENS (TsiTokenizer) du premier `@modifies` à la fin du
   *  commentaire. Un groupe = `$cible : verbe …` ou `verbe` seul ; les groupes se séparent par `;` (ou `,`, ou un tag répété) ;
   *  le mot est le premier ident du groupe après sa cible. `null` sans `@modifies` ; un Set vide pour `@modifies rien`. */
  static contract(src) {
    const i = src.indexOf('@modifies'); if (i < 0) return null;
    const end = src.indexOf('*/', i), tk = new TsiTokenizer(src.slice(i, end < 0 ? src.length : end)), words = new Set();
    const splitter = t => t.val === ';' || t.val === ',' || (t.type === 'attr' && t.val === '$$modifies');   // ce qui sépare deux groupes
    for (tk.current = 0; tk.current < tk.length; ) {
      let t = tk.peek(true);
      if (t.type === 'attr' && t.val === '$$modifies') { tk.next(); continue; }                          // le tag ouvre un groupe
      if (t.type === 'var' && tk.peekNext(true)?.val === ':') { tk.next(); tk.next(); t = tk.peek(true); }   // `$cible :` — la cible ne dit rien
      if (t.type === 'ident' && t.val !== 'rien') words.add(t.val);                                        // le verbe, ou la piste touchée
      const k = tk.searchLevel(splitter, tk.current + 1);                                                   // le prochain séparateur
      tk.current = k < 0 ? tk.length : tk.tokens[k].type === 'attr' ? k : k + 1;
    }
    return words;
  }

  static structural = new TsiIaRole('structural', {
    tracks: ['&face', '&stop', '&synchro', '&synchroPlate', '&clock', '&videoSynchro', '&sliderSynchro'],
    options: ['$$duration', '$$durationPlate', '$$synchronized', '$$module', '$$new', '$$nodeModule'],
    byContract: ['play', 'stop', 'pause', 'goto', 'gotoStop', 'gotoPlay', 'face', 'duration'],
    cargo: 'stub' });
  static semantic = new TsiIaRole('semantic', {
    tracks: ['&text'], options: ['$$doc'], byContract: ['text'], cargo: 'text' });
  static spatial = new TsiIaRole('spatial', {
    tracks: ['&pos', '&size', '&rotat', '&pos3D', '&transform', '&posBar', '&barTop', '&framing', '&left', '&top', '&width', '&height'],
    props: ['display', 'flex', 'flex-direction', 'flex-wrap', 'gap', 'justify-content', 'align-items', 'align-self', 'position', 'left', 'top', 'right', 'bottom',
            'inset', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom',
            'padding-left', 'box-sizing', 'overflow', 'z-index', 'transform', 'transform-origin', 'transform-style', 'perspective', 'perspective-origin',
            'min-width', 'min-height', 'max-width', 'max-height', 'width', 'height'],
    writableProps: null, options: ['$$space3d'], cargo: 'mark' });
  static decorative = new TsiIaRole('decorative', { rest: true, cargo: 'whole' });
  static all = [TsiIaRole.structural, TsiIaRole.semantic, TsiIaRole.spatial, TsiIaRole.decorative];
  static byName(name) { return TsiIaRole.all.find(r => r.name === name) ?? null; }
  static { const s = TsiIaRole.spatial; s.writableProps = new Set([...s.props].filter(p => p !== 'width' && p !== 'height')); }   // une dimension s'écrit &size
}

// ═════════════════════════════════════════════════════════════
//  LE FILTRE PAR RÔLE — projection et fusion de la branche-réduite (PD 11/09)
// ═════════════════════════════════════════════════════════════
//  Un filtre par requête, construit avec un rôle ou plusieurs (le sémantique part avec le structurel). `project` rend le
//  texte que l'IA reçoit et GARDE ce qu'il a masqué, nœud par nœud, sous le nom du nœud (TsiIaMask) ; `merge` relit la
//  réponse, refuse ce qui est écrit hors périmètre et remet ce qui était masqué à sa place. Le texte n'est jamais réécrit :
//  recopié par segments aux positions du relevé (TsiTokenizerIa). Seuls les nœuds à data-tsi sont filtrés — ils ont tous
//  un id, leur identité à la fusion ; le reste du texte voyage tel quel. Propriété : merge(project(x)) = x quand l'IA ne
//  change rien — chaque plage masquée se souvient de ce qui la précédait.
class TsiIaRoleFilter {
  static CARGOS = ['stub', 'mark', 'text', 'whole'];      // du plus fermé au plus ouvert
  constructor(roles) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.cargo = this.roles.map(r => r.cargo).sort((a, b) => TsiIaRoleFilter.CARGOS.indexOf(b) - TsiIaRoleFilter.CARGOS.indexOf(a))[0];
    this.masks = new Map();                                        // idVal → TsiIaMask : ce que project a retiré du nœud
    this.modules = new Map();                                        // nom → { str, tok } : les modules du source, lecteurs des paramètres de leurs instances
    this.readOnly = new Set();                                       // ids envoyés en LECTURE (le module modèle d'une instance) : intacts au retour
    this.sent = new Map();                                           // id → texte envoyé, pour ce qui est en lecture
    this.whole = null;                                               // avec une branche : les nœuds qui partent entiers (sinon null : le document entier)
  }
  seesTrack(n, c)  { return this.roles.some(r => r.seesTrack(n, c)); }
  writesTrack(n, c) { return this.roles.some(r => r.writesTrack(n, c)); }
  seesProp(n)      { return this.roles.some(r => r.seesProp(n)); }
  writesProp(n)     { return this.roles.some(r => r.writesProp(n)); }
  writesOption(n)   { return this.roles.some(r => r.writesOption(n)); }
  get structural() { return this.roles.includes(TsiIaRole.structural); }

  /** Le contrat qui route une piste. Une action : le sien ; si sa valeur est une variable (`&onClick $action;`), celui du
   *  script de cette variable dans la tête du nœud ; sans contrat, faute — le filtre ne lit pas le code. `&button` : celui
   *  de l'action du nœud (PD : « voir son action »). Les autres pistes : null. */
  _contract(str, tok, p) {
    if (TsiIaRole.ACTION.test(p.name)) {
      const text = str.slice(p.pos, p.end);
      let c = TsiIaRole.contract(text);
      const v = c ? null : /^&\w+\s+(\$[A-Za-z_]\w*)\s*;?\s*$/.exec(text);
      if (v) { const item = this._headItems(str, tok.head.pos, tok.head.end).get(v[1]); if (item) c = TsiIaRole.contract(item); }
      if (!c) throw new Error(TsiTokenizer.posError(str, p.pos, `${p.name} : action sans contrat — un script déclare ses @modifies`));
      return c;
    }
    if (TsiIaRole.FOLLOWERS.has(p.name)) {                           // `&button` : ses états — décoratif ; structurel si l'un d'eux ouvre une branche
      const words = new Set(['button']);
      if (new TsiTokenizer(str.slice(p.pos, p.end)).tokens.some(t => t.type === 'ident' && t.val.endsWith('_BRANCH'))) words.add('face');
      return words;
    }
    return null;
  }
  /** Les items d'une tête, par clé — `$$nom` pour `@nom`, `$nom` pour une variable, un paramètre, une déclaration — découpés au
   *  `;` de profondeur zéro, en tokens : `searchLevel` franchit les blocs par `posPair`. */
  _headItems(str, a, b) {
    const tk = new TsiTokenizer(str.slice(a, b)), items = new Map();
    for (let from = 0; from < tk.length; ) {
      const end = tk.searchLevel(';', from), j = end < 0 ? tk.length : end;
      if (j > from) {
        const t0 = tk.tokens[from], t1 = tk.tokens[from + 1];
        const key = t0.type === 'attr' || t0.type === 'var' ? t0.val : t1?.type === 'var' ? t1.val : null;   // `@nom` → $$nom · `$nom` · `letModule $nom`
        const text = str.slice(a + t0.pos, end < 0 ? b : a + tk.tokens[end].pos).trim();
        items.set(key ?? text, text);
      }
      from = j + 1;
    }
    return items;
  }
  /** Les deux attributs filtrés d'un nœud, dans l'ordre du texte. */
  _attrs(t) {
    const a = [{ kind: 'tsi', pos: t.tsi.pos, end: t.tsi.end }];
    if (t.style) a.push({ kind: 'style', pos: t.style.pos, end: t.style.end });
    return a.sort((x, y) => x.pos - y.pos);
  }

  /** L'arbre des nœuds Tispi : le parent de chacun, par inclusion des positions. */
  static _tree(toks) {
    const parent = new Map(), stack = [];
    for (const t of toks) { while (stack.length && stack[stack.length - 1].closeEnd <= t.openPos) stack.pop(); parent.set(t, stack[stack.length - 1] ?? null); stack.push(t); }
    return parent;
  }

  /** LA PROJECTION : le texte pour l'IA. Sans `branches`, le document entier, projeté par le rôle. Avec — un id ou une liste — le
   *  REPLI (PD 11/09) : les branches entières ; une instance entraîne le corps de son module modèle, EN LECTURE ; les modules
   *  instanciés dans ce qui part donnent leur signature ; les ancêtres sont des CADRES (balise, id, tête entière) ; les autres
   *  nœuds sont RÉDUITS (balise, id, tête) s'ils interagissent avec une branche, SUPPRIMÉS sinon. */
  project(document, branches = null) {
    const str = document, tk = new TsiTokenizerIa(str, { reduced: true }), toks = tk.tokens.filter(t => t.tsi);
    for (const t of toks) if (t.role === 'module') this.modules.set(t.name, { str, tok: t });
    if (branches == null) return this._projectRange(str, toks, 0, str.length);
    this.named = tk.tokens.filter(t => t.idVal);                             // tout nœud nommé du source, Tispi ou non : les « connus » d'un cadre
    const B = (Array.isArray(branches) ? branches : [branches]).map(id => {
      const t = toks.find(t => t.idVal === id);
      if (!t) throw new Error(`projection : branche #${id} introuvable — un nœud Tispi, par son id`);
      return t;
    });
    const inside = (t, r) => r.openPos <= t.openPos && t.closeEnd <= r.closeEnd;
    this.source = str; this.toks = toks; this.tree = TsiIaRoleFilter._tree(toks);
    this.whole = [...B];                                                     // ce qui part entier
    for (const b of B) if (b.role === 'new' && this.modules.has(b.name)) {   // une instance : son module modèle l'accompagne, en lecture
      const M = this.modules.get(b.name).tok; if (this.whole.includes(M)) continue;
      this.whole.push(M);
      for (const t of toks) if (inside(t, M)) this.readOnly.add(t.idVal);
    }
    this.signatures = new Set();                                             // les modules instanciés dans ce qui part : leur signature
    for (const t of toks) if (t.role === 'new' && this.whole.some(r => inside(t, r))) { const m = this.modules.get(t.name)?.tok; if (m && !this.whole.includes(m)) this.signatures.add(m); }
    const kept = [...this.whole, ...this.signatures];
    const refs = this.whole.map(r => str.slice(r.openPos, r.closeEnd)).join('\n');   // ce que les branches lisent : ids cités, variables
    this.kind = new Map();
    for (const t of toks)
      this.kind.set(t, this.whole.some(r => inside(t, r)) ? 'whole'
                    : this.signatures.has(t)             ? 'signature'
                    : kept.some(g => inside(g, t))       ? 'frame'          // un ancêtre de ce qui part
                    : t.role === 'nodeModule' && [...this.signatures].some(s => inside(t, s)) ? 'slot'
                    : this._interacts(str, t, refs)      ? 'stub'           // réduit : balise, id, tête
                    : 'dropped');                                            // sans interaction : absent, il revient de l'original
    return toks.filter(t => !this.tree.get(t)).map(t => this._emit(str, t)).filter(Boolean).join('\n');
  }
  /** Un nœud hors chemin interagit avec les branches si son id y est cité, ou si une variable de sa tête y est lue (PD 11/09). */
  _interacts(str, t, refs) {
    const cited = name => new RegExp('(^|[^\\w$])' + name.replace(/\$/g, '\\$') + '(?![\\w])').test(refs);
    if (cited(t.idVal)) return true;
    if (t.role === 'new' || t.role === 'module') return false;                // les paramètres d'une instance ou d'un module ne sont lus que par le module
    for (const key of this._headItems(str, t.head.pos, t.head.end).keys()) if (key.startsWith('$') && !key.startsWith('$$') && cited(key)) return true;
    return false;
  }
  /** L'émission d'un nœud selon sa sorte. */
  _emit(str, t) {
    const children = this.toks.filter(c => this.tree.get(c) === t);
    switch (this.kind.get(t)) {
      case 'whole': {                                                        // la branche, le module modèle : projetés par le rôle
        const text = this._projectRange(str, this.toks.filter(c => c.openPos >= t.openPos && c.closeEnd <= t.closeEnd), t.openPos, t.closeEnd);
        if (this.readOnly.has(t.idVal)) this.sent.set(t.idVal, text);
        return text;
      }
      case 'frame':     return this._openTag(str, t, false) + '\n' + children.map(c => this._emit(str, c)).filter(Boolean).join('\n') + `\n</${t.val}>`;
      case 'signature': return this._openTag(str, t, true) + '\n' + children.filter(c => this.kind.get(c) === 'slot').map(c => this._openTag(str, c, false) + `</${c.val}>`).join('\n') + `\n</${t.val}>`;
      case 'stub':      return this._openTag(str, t, false) + `</${t.val}>`;   // réduit : balise, id, tête — rien dedans
      default:          return '';                                             // supprimé : absent du texte envoyé
    }
  }
  /** La balise ouvrante d'un cadre, d'une signature, d'un slot : la balise, l'id, la tête entière — ni style=, ni pistes, sauf,
   *  pour une signature, son PILOTAGE STRUCTUREL (PD : obligatoire) : les pistes que le structurel voit. */
  _openTag(str, t, piloting) {
    let tsi = str.slice(t.head.pos, t.head.end);
    if (piloting) for (const p of t.tracks) if (TsiIaRole.structural.seesTrack(p.name, this._contract(str, t, p))) tsi += str.slice(p.pos, p.end);
    return `<${t.val} id="${t.idVal}" data-tsi="${tsi.trim()}">`;
  }
  /** Une plage projetée : les nœuds de `toks` entre [a, b), chacun filtré par le rôle ; ce qui est masqué est gardé par nœud. */
  _projectRange(str, toks, a, b) {
    let out = '', cur = a;
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k], m = new TsiIaMask();
      for (const a of this._attrs(t)) {
        const s = a.kind === 'tsi' ? this._projectTsi(str, t, m) : this._projectStyle(str, t, m);
        if (a.kind === 'style' && m.styleRemoved) { out += str.slice(cur, t.style.attr); cur = t.style.end + 1; }   // ` style="…"` entier, ôté
        else { out += str.slice(cur, a.pos) + s; cur = a.end; }
      }
      const leaf = !(toks[k + 1] && toks[k + 1].openPos < t.closePos);   // aucun nœud Tispi dedans : son contenu est sa cargaison
      if (leaf && t.closePos > t.openEnd) {
        const content = str.slice(t.openEnd, t.closePos);
        const keep = this.cargo === 'whole' || this.cargo === 'text';   // texte : envoyée telle quelle (v1 — dépouiller le balisage attend une fusion qui sache le remettre)
        if (!keep) { m.cargo = content; out += str.slice(cur, t.openEnd) + (this.cargo === 'mark' ? '…' : ''); cur = t.closePos; }
      }
      this.masks.set(t.idVal, m);
    }
    return out + str.slice(cur, b);
  }
  _projectTsi(str, t, m) {
    m.head = str.slice(t.head.pos, t.head.end);                      // la tête entière (PD)
    let out = m.head, prev = null;
    for (const p of t.tracks) {
      const c = this._contract(str, t, p), text = str.slice(p.pos, p.end);
      if (this.seesTrack(p.name, c)) { out += text; m.seenTracks.set(p.name, text); prev = p.name; }
      else m.tracks.push({ name: p.name, text, after: prev });
    }
    return out;
  }
  _projectStyle(str, t, m) {
    let out = '', prev = null, cur = t.style.pos;
    for (const p of t.props) {
      const end = p.end < t.style.end && str[p.end] === ';' ? p.end + 1 : p.end;   // la propriété, son ';' et le blanc devant elle
      const text = str.slice(cur, end); cur = end;
      if (this.seesProp(p.name)) { out += text; m.seenProps.set(p.name, text); prev = p.name; }
      else m.props.push({ name: p.name, text, after: prev });
    }
    out += str.slice(cur, t.style.end);
    if (!out.trim()) {                                                 // plus rien : l'attribut entier est ôté, avec le blanc qui le sépare de data-tsi en mémoire
      m.styleRemoved = str.slice(t.style.attr, t.style.end + 1); m.styleBefore = t.style.attr < t.tsi.attr;
      m.styleGap = m.styleBefore ? str.slice(t.style.end + 1, t.tsi.attr) : str.slice(t.tsi.end + 1, t.style.attr);
    }
    return out;
  }

  /** LA FUSION : la réponse relue, contrôlée, complétée de ce qui était masqué. Une faute arrête tout, localisée dans la réponse.
   *  Avec une branche, le document se REBÂTIT depuis l'original : cadres (tête contrôlée, enfants à leur place, nœuds nouveaux à
   *  la fin pour le structurel), souches / slots / signatures intacts, module en lecture intact, branche fusionnée par plage. */
  merge(answer) {
    const str = answer, tk = new TsiTokenizerIa(str, { reduced: true }), toks = tk.tokens.filter(t => t.tsi);
    if (!this.whole) return this._mergeRange(str, toks, 0, str.length, [...this.masks.keys()]);
    const named = tk.tokens.filter(t => t.idVal);                            // les souches n'ont pas de data-tsi : la réponse se lit par ses nœuds nommés
    const byId = new Map(named.map(t => [t.idVal, t])), tree = TsiIaRoleFilter._tree(named), src = this.source;
    const intact = (t, r, what) => { if (str.slice(r.openPos, r.closeEnd).trim() !== what.trim()) throw new Error(TsiTokenizer.posError(str, r.openPos, `#${t.idVal} : hors branche — rien n'y bouge`)); };
    const rebuild = t => {                                                   // t : un nœud de l'ORIGINAL ; rend son texte fusionné
      const r = byId.get(t.idVal);
      if (this.kind.get(t) === 'dropped') {                                  // supprimé à l'envoi : l'original revient ; revenu dans la réponse, faute
        if (r) throw new Error(TsiTokenizer.posError(str, r.openPos, `#${t.idVal} : hors branche — ce nœud n'avait pas été envoyé`));
        return src.slice(t.openPos, t.closeEnd);
      }
      if (!r) throw new Error(`fusion : #${t.idVal} a disparu — hors branche, rien ne bouge`);
      switch (this.kind.get(t)) {
        case 'whole':
          if (this.readOnly.has(t.idVal)) { intact(t, r, this.sent.get(t.idVal)); return src.slice(t.openPos, t.closeEnd); }
          return this._mergeRange(str, toks.filter(c => c.openPos >= r.openPos && c.closeEnd <= r.closeEnd), r.openPos, r.closeEnd,
                                  this.toks.filter(c => c.openPos >= t.openPos && c.closeEnd <= t.closeEnd).map(c => c.idVal));
        case 'frame': {
          let head = str.slice(r.head.pos, r.head.end);                     // la tête : contrôlée comme celle d'un nœud
          if (head.trim() !== src.slice(t.head.pos, t.head.end).trim()) { const m = new TsiIaMask(); m.head = src.slice(t.head.pos, t.head.end); m.tracks = t.tracks.map(p => ({ name: p.name, text: src.slice(p.pos, p.end) })); this._checkHead(str, r, m, head); }
          else head = src.slice(t.head.pos, t.head.end);
          let out = src.slice(t.openPos, t.head.pos) + head, cur = t.head.end;
          for (const c of this.toks.filter(c => this.tree.get(c) === t)) { out += src.slice(cur, c.openPos) + rebuild(c); cur = c.closeEnd; }
          const known = new Set(this.named.map(c => c.idVal)), fresh = named.filter(c => tree.get(c) === r && !known.has(c.idVal));
          if (fresh.length && !this.structural) throw new Error(TsiTokenizer.posError(str, fresh[0].openPos, `#${fresh[0].idVal} : nœud nouveau — seul le structurel modifie l'arbre`));
          const end = src.lastIndexOf('</', t.closeEnd);                     // les nouveaux : avant la fermante du cadre
          return out + src.slice(cur, end) + fresh.map(c => str.slice(c.openPos, c.closeEnd) + '\n').join('') + src.slice(end, t.closeEnd);
        }
        default:                                                             // souche, slot, signature : intacts, l'original revient
          intact(t, r, this._emit(src, t));
          return src.slice(t.openPos, t.closeEnd);
      }
    };
    let out = '', cur = 0;
    for (const t of this.toks.filter(t => !this.tree.get(t))) { out += src.slice(cur, t.openPos) + rebuild(t); cur = t.closeEnd; }
    return out + src.slice(cur);
  }
  /** Une plage fusionnée : les nœuds de `toks` entre [a, b) ; `ids` : ceux que l'original y avait — un absent a disparu. */
  _mergeRange(str, toks, a, b, ids) {
    const seen = new Set();
    let out = '', cur = a;
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k], m = this.masks.get(t.idVal); seen.add(t.idVal);
      if (!m && !this.structural) throw new Error(TsiTokenizer.posError(str, t.openPos, `#${t.idVal} : nœud nouveau — seul le structurel modifie l'arbre`));
      const putBackStyle = m?.styleRemoved && !t.style;                   // l'attribut ôté revient à sa place, devant ou derrière data-tsi
      if (putBackStyle && m.styleBefore) { const at = str.startsWith(m.styleGap, t.tsi.attr - m.styleGap.length) ? t.tsi.attr - m.styleGap.length : t.tsi.attr; out += str.slice(cur, at) + m.styleRemoved; cur = at; }
      for (const a of this._attrs(t)) { out += str.slice(cur, a.pos) + (a.kind === 'tsi' ? this._mergeTsi(str, t, m) : this._mergeStyle(str, t, m)); cur = a.end; }
      if (putBackStyle && !m.styleBefore) { const at = str.startsWith(m.styleGap, t.tsi.end + 1) ? t.tsi.end + 1 + m.styleGap.length : t.tsi.end + 1; out += str.slice(cur, at) + m.styleRemoved; cur = at; }
      if (m?.cargo != null) {                                    // une cargaison masquée revient ; l'IA n'y touche pas
        const received = str.slice(t.openEnd, t.closePos);
        if (received.trim() !== (this.cargo === 'mark' ? '…' : '')) throw new Error(TsiTokenizer.posError(str, t.openEnd, `#${t.idVal} : cargaison hors périmètre du rôle`));   // comparée en trim (PD)
        out += str.slice(cur, t.openEnd) + m.cargo; cur = t.closePos;
      }
    }
    for (const id of ids) if (!seen.has(id) && !this.structural) throw new Error(`fusion : le nœud #${id} a disparu — seul le structurel modifie l'arbre`);
    return out + str.slice(cur, b);
  }
  /** Les pistes masquées reviennent chacune après celle qui la précédait ; celles dont la précédente a disparu, à la fin. */
  static _putBack(remaining, after, emit) {
    for (let i = 0; i < remaining.length; ) { if (remaining[i].after === after) { emit(remaining[i].text); remaining.splice(i, 1); } else i++; }
  }
  _mergeTsi(str, t, m) {
    let out = str.slice(t.head.pos, t.head.end);
    if (m && out.trim() !== m.head.trim()) this._checkHead(str, t, m, out);                          // comparée en trim (PD)
    const remaining = m ? [...m.tracks] : [], emit = s => { out += s; };
    TsiIaRoleFilter._putBack(remaining, null, emit);
    for (const p of t.tracks) {
      const c = this._contract(str, t, p), text = str.slice(p.pos, p.end);
      if (!this.writesTrack(p.name, c) && text.trim() !== m?.seenTracks.get(p.name)?.trim()) throw new Error(TsiTokenizer.posError(str, p.pos, `${p.name} : piste hors périmètre du rôle`));   // vue, pas écrite : intacte au trim près
      out += text; TsiIaRoleFilter._putBack(remaining, p.name, emit);
    }
    for (const r of remaining) out += r.text;
    return out;
  }
  _mergeStyle(str, t, m) {
    let out = '', cur = t.style.pos;
    const remaining = m ? [...m.props] : [], emit = s => { out += s; };
    TsiIaRoleFilter._putBack(remaining, null, emit);
    for (const p of t.props) {
      const end = p.end < t.style.end && str[p.end] === ';' ? p.end + 1 : p.end, text = str.slice(cur, end); cur = end;
      if (!this.writesProp(p.name) && text.trim() !== m?.seenProps.get(p.name)?.trim()) throw new Error(TsiTokenizer.posError(str, p.pos, `${p.name} : propriété hors périmètre du rôle`));
      out += text; TsiIaRoleFilter._putBack(remaining, p.name, emit);
    }
    for (const r of remaining) out += r.text;
    return out + str.slice(cur, t.style.end);
  }
  /** La tête a changé : item par item. Une option passe par `writesOption` ; une variable, un paramètre, une déclaration, si une
   *  piste que le rôle écrit la lit (PD : « le rôle des pistes qui la lisent ») — les pistes du nœud, ou celles de son MODULE
   *  pour le paramètre d'une instance ; qu'aucune piste ne lit : le structurel. */
  _checkHead(str, t, m, head) {
    const before = this._headItems(m.head, 0, m.head.length), after = this._headItems(head, 0, head.length);
    const readers = [...t.tracks.map(p => str.slice(p.pos, p.end)), ...m.tracks.map(p => p.text)].join('\n');
    const mod = t.role === 'new' ? this.modules.get(t.name) : null;
    const reads = (s, tok, key) => tok.tracks.some(p => s.slice(p.pos, p.end).includes(key) && this.writesTrack(p.name, this._contract(s, tok, p)));
    for (const key of new Set([...before.keys(), ...after.keys()])) {
      if (before.get(key) === after.get(key)) continue;
      const ok = key.startsWith('$$') ? this.writesOption(key)
               : reads(str, t, key) || (mod && reads(mod.str, mod.tok, key)) || (this.structural && !readers.includes(key));
      if (!ok) throw new Error(TsiTokenizer.posError(str, t.head.pos, `#${t.idVal} : ${key} — item de tête hors périmètre du rôle`));
    }
  }
}
/** Ce que la projection a retiré d'un nœud, et ce qu'elle a laissé voir : la mémoire d'une fusion. */
class TsiIaMask {
  constructor() {
    this.head = '';                  // la tête envoyée, pour voir si elle a changé
    this.seenTracks = new Map();           // piste vue → son texte (vue mais pas écrite : doit revenir intacte)
    this.tracks = [];                // pistes masquées : { name, texte, apres }
    this.seenProps = new Map();      // propriété vue → son texte
    this.props = [];                 // propriétés masquées : { name, texte, apres }
    this.styleRemoved = null;            // ` style="…"` entier quand plus rien n'y restait ; styleAvant : il précédait data-tsi
    this.styleBefore = false;
    this.styleGap = '';              // le blanc entre l'attribut ôté et data-tsi, pour le remettre au même endroit
    this.cargo = null;           // le contenu d'une feuille, quand il a été vidé ou marqué
  }
}

// ⚰ TsiCompiler ENTERRÉ le 2026-09-29 (E-1c, PD) : ses quatre statiques ont rejoint leurs clients — `_at` → `TsiTokenizer.at`,
//   `_isAmp` → `TsiTokenizer.isAmp`, `_valueRaw` et `_normText` → `TsiVal` (tispiVar.js). `compileText` et `knownFunctions`
//   n'existaient plus que dans des textes et des tests anciens.

// ── DÉPLACÉ le 2026-08-13 → TsiParserTabPlate.js ─────────────────────────────
//  TsiAttrSaver, toute la classe TsiDecompiler et les trois raccourcis clavier
//  (Ctrl+Shift+E export branche · D page · S sauvegarde) vivaient ici. Ils
//  travaillent sur la TABLE PLATE et doublonnaient, rôle pour rôle, la chaîne
//  de debuild écrite dans les classes. Séparés physiquement pour que les deux
//  cessent de se confondre. Ce fichier ne garde que TsiTokenizer, ses héritiers
//  et les marqueurs de macro.
// ─────────────────────────────────────────────────────────────────────────────

  class TsiMacro {
    constructor(name, piece){
      this.name = name;
      this.piece = piece;       // destination ou autre information pertinente
    }
  }

  class TsiMacroOpen extends TsiMacro {
    constructor(name, piece, target) {
      super(name, piece);
      this.target = target;
    }
    build() {
      if(this.piece.macros==null) this.piece.macros = [];
      this.piece.macros.push([this.name, this.target]);
    }
  }
  class TsiMacroClose extends TsiMacro {
    constructor(name, piece) {
      super(name, piece);
    }
    build() {
      const macro = this.piece.macros;
      if(macro==null || macro.length===0) return;
      macro.pop();
    }
  }


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiUndo.js  (105 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
//  tispiUndo.js — Historique undo / redo de WvAnim (Tispi)
// ═══════════════════════════════════════════════════════════════════════════
//
//  MODÈLE = VÉRITÉ. Le texte data-tsi est consommé au parsing puis jeté ; seules
//  les classes + tables portent la vérité. L'undo agit donc UNIQUEMENT sur le
//  modèle, en REJOUANT des opérations INVERSES via les mêmes primitives d'édition
//  → réconciliation de piste (gotoPlay/gotoStop), invalidation d'`_anim` et
//  cascade `animDuration` re-arrivent GRATUITEMENT : un undo est une édition
//  comme une autre.
//
//  UNITÉ = le CRAN, délimité par des BALISES. La pile est PLATE : des inverses
//  (closures) entrecoupés de balises {label}. Une balise est posée en DÉBUT
//  d'action-tispi (onClick, onTime) — il n'y a PAS de fin de transaction : tout
//  ce qui intervient ENTRE deux balises rejoint le cran ouvert, y compris les
//  atterrissages ASYNCHRONES (fetch d'import…) et leurs `record` tardifs.
//      TsiUndo.newTransaction('onClick');
//        … actions (chaque atome dépose son inverse via TsiUndo.record) …
//
//  DEUX RÈGLES :
//   • balise déjà au sommet (action précédente sans mutation) → pas de doublon —
//     c'est ce qui évite de démultiplier les crans, la balise n'a pas un rôle
//     strict de vérité causale ;
//   • undo/redo = dépiler en REJOUANT les inverses jusqu'à CONSOMMER une balise
//     (une balise vide au sommet est jetée au passage).
//
//  FORME D'UN INVERSE : une closure qui rejoue l'op inverse VIA les primitives
//  (donc qui ré-enregistre SON propre inverse) → undo et redo = le MÊME
//  mécanisme, symétrique. (Évolution possible : op structurée/sérialisable pour
//  un journal inspectable ou persistant — `record` reste le point d'entrée.)
//
//  NE JOURNALISER QUE LA VÉRITÉ (keys / pistes / éléments / provenance). Le
//  DÉRIVÉ (rebuildAnimate, manageAnimDuration, `_anim`, display) se re-produit au
//  rejeu — ne rien déposer pour lui.

class TsiUndo {
  static _undo    = [];      // pile PLATE : function (inverse) | {label} (balise)
  static _redo    = [];      //   idem (sens redo)
  static target   = 'undo';  // pile de DESTINATION courante : 'undo' (défaut) ou 'redo' (pendant un undo)
  static replaying = false;  // PUBLIC : vrai pendant un undo/redo (signal runtime + garde « ne pas vider _redo »)

  static _stack(name) { return name === 'redo' ? this._redo : this._undo; }

  // ── Balise de début de cran (posée par le dispatcher d'actions) ──────────────
  static newTransaction(label = '') {
    const pile = this._stack(this.target);
    const top  = pile[pile.length - 1];
    if (top && typeof top !== 'function') return;  // balise déjà au sommet → pas de doublon
    pile.push({ label });
  }

  // ── Dépôt d'un inverse (appelé par une primitive APRÈS sa mutation) ──────────
  //  `inverse` : closure qui, jouée, défait la mutation VIA les primitives.
  //  Empile TOUJOURS — le cran d'appartenance est celui de la dernière balise.
  static record(inverse) {
    this._stack(this.target).push(inverse);
    if (this.target === 'undo' && !this.replaying) this._redo.length = 0;  // vraie édition (pas un redo) → invalide le redo
  }

  // ── Undo / Redo ──────────────────────────────────────────────────────────────
  static undo() { this._run('undo', 'redo'); }   // consomme _undo → record sur target 'redo'
  static redo() { this._run('redo', 'undo'); }   // consomme _redo → record sur target 'undo'

  //  Dépile `from` en rejouant les inverses (ordre pile = déjà inverse) jusqu'à
  //  consommer une balise. Le temps du rejeu, `target` bascule sur `to` : chaque
  //  `record` déclenché par les atomes tombe donc sur la BONNE pile, sans
  //  qu'aucune primitive n'ait à s'en soucier. C'est LE cœur de la symétrie undo/redo.
  static _run(from, to) {
    const pile = this._stack(from);
    if (!pile.length) return;
    const savedTarget = this.target, savedReplaying = this.replaying;
    this.target = to; this.replaying = true;       // bascule de cible + signal rejeu (markDirty + garde _redo)
    this.newTransaction();                         // balise du cran symétrique sur la pile cible
    let replayed = 0;
    while (pile.length) {
      const item = pile.pop();
      if (typeof item === 'function') { item(); replayed++; }
      else if (replayed) break;                    // balise consommée → fin du cran
    }                                              // (balise vide en tête → jetée, on continue)
    this.target = savedTarget; this.replaying = savedReplaying;
  }

  // ── État / util ──────────────────────────────────────────────────────────────
  static canUndo() { return this._undo.some(i => typeof i === 'function'); }
  static canRedo() { return this._redo.some(i => typeof i === 'function'); }
  static clear()   { this._undo.length = 0; this._redo.length = 0; this.target = 'undo'; this.replaying = false; }
}

// ── Branchement d'une primitive (patron, à appliquer p.ex. dans insertKey) ─────
//  Après avoir muté la table, la primitive dépose l'inverse de CE qu'elle a fait.
//  L'inverse doit restaurer VALEUR **et** PROVENANCE (la key écrasée telle quelle),
//  pas juste ré-appeler avec une valeur — d'où la capture de la key écrasée :
//
//    // collision (remplacement) : garder l'écrasée, inverse = la remettre
//    const prev = keys[hit];
//    … remplacement …
//    TsiUndo.record(() => o_.functions.restoreKey(track, frame, prev));
//
//    // insert pur : inverse = supprimer
//    … insertion …
//    TsiUndo.record(() => o_.functions.deleteKey(track, frame));
//
//  `restoreKey`/`deleteKey` restent à écrire sur le même modèle : chacun dépose
//  SON inverse (→ redo automatique). Ils réconcilient la piste comme insertKey.


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiTrack.js  (2836 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
//  tispiTrack.js — LE MOTEUR TEMPOREL
// ═════════════════════════════════════════════════════════════════════════════
//
//  TsiTransition · la famille TsiKey* · la famille TsiTrack* · les services
//  d'horloge (maître, esclave, vidéo) et TsiTrackClock · TsiTimeline.
//
//  Une Piste = une propriété = un animate WAAPI : c'est ICI que l'animation se
//  joue. Le Plateau synchronise, il ne pilote pas. Les propriétés animables
//  concrètes (size, color, rotat…) sont ailleurs : tispiTracksCss.js.
//
//  CHARGEMENT : 1er des quatre, AVANT tispiCore.js — les classes Css de
//  tispiCore portent `static track = TsiTrackFace`, évalué à la définition
//  comme un extends ; l'ordre inverse lève « TsiTrackFace is not defined ».
//  Ce fichier n'a lui-même aucune dépendance eager : ses usages de Tsi_ et de
//  o_ sont tous en corps de méthode, donc résolus à l'appel.
//
//  Issu de la découpe de tispi001.js (2026-08-09) — voir aussi tispiCore.js,
//  tispiPiece.js, tispiTracksCss.js.
// ═════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════
//  TRANSITION
// ═════════════════════════════════════════════════════════════
class TsiTransition {
  //  LE NONE EXPLICITE — « une transition est ÉCRITE, et elle dit AUCUNE » : le
  //  créneau VIDE `!<>` (piste, élément) / `<>` (key). Il STOPPE la cascade
  //  key(-1) → piste(-2) → élément(-3) → app(-4) — `??` traverse null (« rien
  //  d'écrit, hérite ») mais s'arrête sur lui — puis les sites runtime le
  //  convertissent en null (aucun comportement). VRAIE instance FIGÉE : debuild()
  //  est appelable dessus (ré-émet `<>`), les gardes du debuild sont tombées.
  //  PARESSEUX : le ctor lit TsiValEase_ (tispiVar.js, chargé APRÈS ce fichier) —
  //  une construction au chargement lèverait.
  static _NONE = null;
  static get NONE() { return TsiTransition._NONE ??= Object.freeze(new TsiTransition('')); }

  //  Le payload VIDE d'un chevron, `<>` : le NONE explicite. ⚠ `<0:>` (durée 0) n'est PAS vide.
  //  (La fabrique `build(p)` est partie à l'étape E-2, 30/09 : chaque nature a SON `static build(tk)`, plus bas.)
  static isEmpty(p) { const [d, e, fx, dl, wh] = p; return d == null && e == null && fx == null && !dl && !wh; }
  /**
   * @param {Array|string} p
   *
   *  Forme tableau  [duration, ease, effect, delay] — chacun peut être omis (sparse [,,,])
   *    p[0]  duration  {number}  frames        omis → null = intervalle complet (key→key suivante)
   *    p[1]  ease      {string}  easing CSS    omis → 'linear'
   *    p[2]  effect    {string|Array}  nom de l'effet   omis → null
   *    p[3]  delay     {number}  frames        omis → 0
   *
   *  Forme string  — durée implicite (intervalle complet), sans marqueur -1/-2/-3/-4
   *    ""        → TsiTransition.NONE
   *    "easein"  → duration=null, ease='easein'
   *  Note : "" est intercepté avant construction et converti en TsiTransition.NONE.
   *
   * Exemples :
   *   new TsiTransition([300])                          → duration=300,  ease='linear'
   *   new TsiTransition([300, "easein"])                → duration=300,  ease='easein'
   *   new TsiTransition([300, "easein", "fade", 10])   → duration=300,  ease='easein', effect='fade', delay=10
    const onExitPiece = (piece, params) => {
      return "continue";
    }
    messagePieceTree(onEnterPiece, onExitPiece, params);  
   *   new TsiTransition([,,,])                         → duration=null, ease='linear'
   *   new TsiTransition([])                            → duration=null, ease='linear'
   *   new TsiTransition("")                            → TsiTransition.NONE
   *   new TsiTransition("easein")                      → duration=null, ease='easein'
   */
  constructor(p = []) {
    if (typeof p === 'string') {
      this.duration = null;
      this.ease     = TsiValEase_.build(p || 'linear');       // créneau ACCÉLÉRATION → une occurrence
      this.process  = null;
      this.delay    = 0;
      this.when     = 0;
    } else {
      this.duration = (p[0] !== undefined) ? p[0] : null;
      this.ease     = TsiValEase_.build(p[1] ?? 'linear');   // créneau ACCÉLÉRATION → une occurrence
      this.process  = p[2] ?? null;                          // le PROCESS : la fonction qui prend la main (39l)
      this.delay    = p[3] ?? 0;
      // when (PD 30/09) : 0 = sauf à l'apparition (défaut) |
      // 1 = uniquement à l'apparition | 2 = partout (apparition + bascules).
      this.when     = p[4] ?? 0;
    }
  }
  /** LA TRANSITION SE RESTITUE : `<durée:accél,effet,délai:quand>`.
   *
   *  RÈGLE DE SÉPARATION, portée par `separExpected` : chaque bloc ANNONCE ce que le
   *  suivant devra poser — un TEMPS (finissant par ':') sépare tout seul et annonce
   *  RIEN ; les autres annoncent ','. La règle se lit, elle ne se déduit pas de la
   *  queue de la chaîne. Émission COMPACTE : les espaces d'agrément ont été retirés
   *  (2026-08-13) — round-trip vérifié sur 7 formes par le vrai parseur.
   *
   *  `linear` est le défaut de l'accélérateur, donc omis — TsiValEase_ porte sa forme
   *  canonique (`_in_`, `_c_(…)`…), plus aucune table inverse à consulter.
   *
   *  NONE S'ÉCRIT (2026-08-15) : il ré-émet `<>` — le créneau vide, son signe
   *  source — par le chemin GÉNÉRIQUE (duration null, ease linear omis, rien
   *  d'autre → `<` + `>`), aucun cas particulier. Le round-trip tient :
   *  `!<>` relu → payload vide → TsiTransition.build → NONE. Et `<0:>` reste
   *  une instance ordinaire de durée 0, DISTINCTE de NONE (cf. build).
   */
  //  MON PORTEUR : mon EASE — un TsiValEase, donc une VALEUR à part entière (elle
  //  peut porter une variable). Je ne m'annonce pas moi-même : une transition n'a
  //  pas d'idUnic, elle n'est pas un composant du registre — on me TRAVERSE.
  //  ⚠ NONE est FIGÉE (Object.freeze) : ce parcours ne lit que, il ne mute rien.
  messageComponents(onComp) {
    const e = this.ease;
    if (!e?.constructor?.isTsiValue) return;         // 'linear' brut : pas un composant
    const r = onComp(e, 'value'); if (r && r !== 'continue') return r;
    return e.messageComponents?.(onComp);
  }

  debuild() {
    let out = '<';
    let separExpected = '';                          // ce que le PROCHAIN devra poser
    out += this.debuildHead();
    if (this.ease && this.ease !== TSI_LINEAR) {
      out += this.ease.debuild();
      separExpected = ',';
    }
    if (this.process) {
      out += separExpected + String(this.process);
      separExpected = ',';
    }
    if (this.delay) {
      out += separExpected + this.delay + ':';
      separExpected = '';
    }
    if (this.when) {
      out += separExpected + String(this.when);      // when — 0 = défaut, omis
    }
    return out + '>';
  }
  debuildHead() { return ''; }                       // le parent : NONE et l'interpolation n'ont pas de durée à écrire

  // ⚰ REMPLACÉ le 2026-08-10 par TsiValEase_.build (tispiVar.js) : le vocabulaire des
  // accélérateurs — mots longs, alias courts, `_c_(…)` — vit désormais dans SA famille
  // de classes, une occurrence fixe par valeur. Résolution à l'APPEL, donc sans
  // contrainte d'ordre de chargement (tispiVar.js est lu après ce fichier).
  //static _resolveEase(e) { return TsiCompiler._EASE[e] ?? e; }
  static setTransition(div, propCss, propJs, duration, ease = 'linear', delay = 0) {
    if(duration==0) {div.style.transition = 'none'; return;}

    if (!div._transitions) div._transitions = {};
    div._transitions[propJs] = `${propCss} ${Math.floor(duration)}ms ${ease} ${Math.floor(delay)}ms`;
    div.style.transition = Object.values(div._transitions).join(', ');
  }
  //  (parse / parseRaw / resolve SUPPRIMÉES 2026-08-15 — les décodeurs de la
  //   TABLE PLATE, sans appelant vivant : la construction directe fait
  //   TsiTransition.build(payload) partout, y compris o_.start. C'étaient les
  //   derniers producteurs « historiques » de NONE — le producteur vivant est
  //   build(), sur le créneau vide `!<>` / `<>`.)
}

//  LA NATURE D'UN CHEVRON EST UNE CLASSE (étape E-2, PD 28-30/09), choisie sur le premier signe avant la lecture.
//  TsiEffect : une DURÉE — l'apparition, avant une key ou en tête de div / de piste.
//  TsiHideEffect : l'effet de DISPARITION d'une piste, après ses keys. Lu et ré-émis ; son jeu arrive avec l'étape Face.
//  TsiInterpolation : SANS durée, la durée EST l'intervalle.
//  Chaque classe écrit SON `build` : le `new` nomme la classe (PD 29/09). Le contenu du chevron est lu par
//  `TsiTransitionBuilder._transition` (tispiBuild.js), résolu à l'APPEL.
class TsiEffect extends TsiTransition {
  /** Entrée : sur '<'. Sortie : après '>'. */
  static build(tk) { const p = TsiTransitionBuilder._transition(tk); return TsiTransition.isEmpty(p) ? TsiTransition.NONE : new TsiEffect(p); }
  debuildHead()    { return this.duration + ':'; }
}
class TsiHideEffect extends TsiEffect {
  static build(tk) { const p = TsiTransitionBuilder._transition(tk); return TsiTransition.isEmpty(p) ? TsiTransition.NONE : new TsiHideEffect(p); }
}
class TsiInterpolation extends TsiTransition {
  static build(tk) { const p = TsiTransitionBuilder._transition(tk); return TsiTransition.isEmpty(p) ? TsiTransition.NONE : new TsiInterpolation(p); }
}












//    ####    ####    #########   ####    #### 
//    ####   ####     ####        ####    ####        
//    ####  ####      ####         ####  ####     
//    ########        ########      ########     
//    ####  ####      ####            ####     
//    ####   ####     ####            ####     
//    ####    ####    #########       ####     

// ═════════════════════════════════════════════════════════════
//  KEYS
// ═════════════════════════════════════════════════════════════
/**
 * Builder
 * tispiBuild.js buildKeys() line 371<br>
 * {@link TsiNodeBuilder#buildKeys}
 */
class TsiKey{
  //  LA FORME D'UNE KEY — déclarée UNE fois, ici, pour TOUTE la famille.
  //  ⚠ 2026-08-13 : `value` et `prop` étaient créés par les HÉRITIÈRES, chacune dans
  //  SON ordre (TsiKeySpatial : value puis prop · TsiKeyCss : prop puis value) —
  //  mêmes champs, formes DIFFÉRENTES pour le moteur. Et `showEffect` / `macros`
  //  arrivaient du FABRICANT (tispiBuild.js:469-471) sans être déclarés. Déclarés
  //  ici, les héritières et le fabricant ne font plus qu'AFFECTER.
  constructor(numFrame = null) {
      this.numFrame   = (numFrame == null) ? null : Number(numFrame);   // invariant : numérique quand la key est POUSSÉE dans sa piste (jamais string) — elle peut NAÎTRE sans (étape E-1, 28/09)
      this.value      = null;               // affectée par l'héritière
      this.prop       = null;               // affectée par l'héritière (face / clock : implicite, reste null)
      this.interpolation = null;            // l'INTERPOLATION vers la key suivante (départ d'intervalle) — vocabulaire 39j/39k
      this.effect     = null;               // l'EFFET d'apparition (arrivée), `<durée:…>` avant la frame — posé par le fabricant si présent
      this.mark       = null;               // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark) — balise de paramètre, type scalaire : la VALEUR de cette key appartient au paramètre — conversions seules, runtime aveugle
      this.vars       = null;               // VARIABLES DE KEY (`frame:$nom := valeur;`) — TsiVars, créée à la 1re déclaration
      this.macros     = null;               // PROVENANCE : pile [nom, target] copiée à la naissance (tispiBuild.js)
      this.attrs      = {};                 // ATTRIBUTS de key (chantier exposition, PD 20/08) — `<$$xl>` :
                                            //   même organe que TsiNode.attrs, posé par le futur dispatch des blocs
  }

  //  LA KEY SE REMPLIT DANS L'ORDRE DE LA SOURCE (étape E-1, PD 28/09) : elle naît à son premier jeton, reçoit sa frame
  //  puis sa valeur. Le constructeur complet (pseudo-key, addKey, key 0 d'héritage) passe par les mêmes méthodes.
  setFrame(numFrame) { this.numFrame = Number(numFrame); }
  setValue(value)    { this.value = value; }                  // les héritières qui TRANSFORMENT la valeur surchargent ici (TsiKeyClock)

  // Key vide = ne porte que numFrame (aucune value posée par une sous-classe).
  isEmpty() { return this.value === undefined; }

  //  MES PORTEURS : mes attributs (`<$$xl>`), mes variables de key, ma valeur.
  //  Contrat aveugle — cf. TsiVal.messageComponents.
  messageComponents(onComp) {
    for (const nom in this.attrs) {
      const a = onComp(this.attrs[nom], 'attr'); if (a && a !== 'continue') return a;
      const w = this.attrs[nom].messageComponents(onComp); if (w) return w;
    }
    for (const v of this.vars?.values() ?? []) {
      const r = onComp(v, 'var'); if (r && r !== 'continue') return r;
      const w = v.messageComponents?.(onComp); if (w) return w;
    }
    //  MES TRANSITIONS — celle qui est ÉCRITE (`<10:ease>`) et celle que le goto a
    //  résolue. Une transition n'est pas un composant (aucun idUnic) : on la
    //  TRAVERSE, et c'est son ease — une VALEUR — qui est annoncée.
    for (const tr of [this.interpolation, this.effect]) {
      const w = tr?.messageComponents?.(onComp); if (w) return w;
    }
    const val = this.value;
    if (!val?.constructor?.isTsiValue) return;         // brut (posé au runtime) : pas un composant
    const r = onComp(val, 'value'); if (r && r !== 'continue') return r;
    return val.messageComponents?.(onComp);
  }


  // ═══ DEBUILD — la key ÉCRIT dans le buffer : `<goto>? frame:valeur <play>?;` ═══
  //  Squelette COMMUN aux 14 familles ; une famille dont la valeur s'écrit
  //  autrement ne surcharge que debuildValue — jamais le squelette (même
  //  partage que debuildDataTsi / debuildHeader côté nœud).
  //  NON PORTÉ de l'ancien émetteur (keysDsl / value — mesuré 2026-08-14) :
  //   • k._macro : champ qui n'a jamais existé — la provenance est `k.macros`,
  //     et le recollage des KEY-macros est FAIT (debuildKeys, 2026-08-15) ;
  //   • k.mark : balise de paramètre de module — hors scope (compression) ;
  //   • key.vars / varName / src : aucun producteur vivant (addVar sans
  //     appelant ; les deux `k.src =` sous /* */ dans tispiTracksCss.js).
  debuild(ctx) {
    //  EN-TÊTE de key `<$$…>` (exposition, PD 20/08) — AVANT l'arrivée, comme à la
    //  lecture ; chaque attribut s'écrit LUI-MÊME (TsiAttr.debuild, forme développée).
    const noms = Object.keys(this.attrs);
    if (noms.length) {
      ctx.dt += '<';
      noms.forEach((n, i) => { if (i) ctx.dt += '; '; this.attrs[n].debuild(ctx); });
      ctx.dt += '> ';
    }
    if (this.effect) ctx.dt += this.effect.debuild() + ' ';           // l'effet d'apparition, avant la frame
    if(this.numFrame > 0) ctx.dt += this.numFrame + ':';
    this.debuildValue(ctx);
    if (this.interpolation) ctx.dt += ' ' + this.interpolation.debuild();
    ctx.dt += ';';
  }

  //  Key VIDE → rien après le ':' — MÊME règle pour toutes les pistes, l'horloge
  //  comprise (PD : pas de traitement spécifique). `v == null` couvre null ET
  //  undefined — l'ancien émetteur ne testait qu'undefined : un null sortait
  //  en toutes lettres ("null").
  debuildValue(ctx) {
    const v = this.value;
    if (v == null || v === '') return;
    if (v.constructor?.isTsiValue) v.debuild(ctx);           // valeur RÉIFIÉE — écrit SA source (accès aveugle)
    else ctx.dt += Array.isArray(v) ? v.join(',') : String(v);   // BRUT : posé au runtime (insertKey)
  }

  /** Déclare une variable SUR cette key (hors bac-à-sable — accès extérieur
   *  par ADRESSE `pathPiece.$nom`). La table this.vars (TsiVars) = SA vérité —
   *  la key est AUTONOME : AUCUN registre chez la Pièce (on la CHERCHE, on ne
   *  la fiche pas). La Pièce ne sert que de véhicule CSS (callback onSet). */
  addVar(nom, value, piece, track = null) {
    // Le MÊME nom peut être déclaré par PLUSIEURS keys de la Pièce : ce n'est
    // pas un doublon fautif — l'affectation adressée (pathPiece.$nom) balaie
    // TOUT et les sert toutes (PD : une adresse pilote plusieurs keys).
    // La CLASSE de vars vient de la NATURE de la piste (css.keyVarsFor) :
    // ANIMATE → TsiVars + property CSS ; STATE (face) → TsiVarsKeyFace.
    this.vars ??= track ? o_.css[track.prop].keyVarsFor(this, track)
                        : new TsiVars((n, v, e) => Tsi_.setVarProperty(e.piece, n, v));
    this.vars.add(nom, { value: String(value), piece });
  }

  /** Affecte une variable d
   * CSS). */
  setVar(nom, value) {
    if (!this.vars?.has(nom)) TsiError.error(`variable de key $${nom} : absente de cette key`);
    return this.vars.set(nom, String(value));
  }

  /** Supprime une variable de cette key (table + properties). */
  supprVar(nom) {
    const v = this.vars?.suppr(nom);
    if (!v) return;
    const st = v.piece.div.style, q = Tsi_.varCssName(v.piece, nom);
    st.removeProperty(q);
    for (let i = 0; st.getPropertyValue(`${q}-${i}`); i++) st.removeProperty(`${q}-${i}`);
  }

  /**
   * Temps WAAPI (ms) de la key.
   * Dérivé de numFrame à la lecture : o_.FRAME_MS peut être redéfini par
   * o_.start(a, frameDuration) APRÈS la construction des keys (parse HTML),
   * donc une valeur stockée en dur serait périmée. numFrame reste la donnée
   * mémorisée ; timeMs est sa projection dans le temps WAAPI.
   */
  get timeMs() { return Tsi_.frameToMs(this.numFrame); }

  /**
   * Calcule la durée réelle jusqu'à la key suivante, corrigée par la dérive horloge.
   *
   * @param  {TsiTrack} track
   * @param  {number}   keyIndex   — index de la key courante dans track.keys
   * @returns {[number, TsiKey]}
   *   [  -1,  -1  ]  → pas de key suivante (key courante = dernière de la piste)
   *   [ ms, nextKey ] → durée corrigée en millisecondes + référence à la key suivante
   *
   * ─────────────────────────────────────────────────────────────────
   *  DURÉE NOMINALE
   * ─────────────────────────────────────────────────────────────────
   *
   *  nominalDuration = nextKey.timeMs - this.timeMs
   *
   *  Durée théorique de l'intervalle (temps WAAPI, ms), sans correction.
   *  Retournée telle quelle si aucune horloge n'est attachée à la piste.
   *
   * ─────────────────────────────────────────────────────────────────
   *  CORRECTION DE DÉRIVE  (si track.piece.ptClock présent)
   * ─────────────────────────────────────────────────────────────────
   *
   *  driftMs = TsiTrackClock.getTimeMs(ptClock) - this.timeMs
   *    → écart (ms) entre l'horloge du plateau et la position théorique
   *      de la piste au moment où la key s'exécute.
   *      Positif  : la piste est en retard sur l'horloge
   *      Négatif  : la piste est en avance (rare)
   *
   *  duration = max(0, nominalDuration - driftMs)
   *    → on réduit le setTimeout du retard accumulé pour resynchroniser.
   *      Plancher à 0 : on ne peut pas remonter dans le temps.
   *
   * ─────────────────────────────────────────────────────────────────
   *  USAGE
   * ─────────────────────────────────────────────────────────────────
   *
   *  Appelée au début de chaque exec() de key pour obtenir la durée à passer
   *  à waitInterval() / les intervalles vers la key suivante.
   *  Couplée à startSyncWatcher() qui corrige la dérive entre deux keys.
   */
  nextKeySync(track, keyIndex) {
    //______________________________________
    // Vérifie si la key est la dernière de la piste
    const nextKey = track.getKeyNext(keyIndex);
    if(nextKey==null) return [-1, -1];

    const nominalDuration = nextKey.timeMs - this.timeMs;
    const clock = track.piece?.ptClock;
    if(!clock) return [nominalDuration, nextKey];

    const driftMs  = TsiTrackClock.getTimeMs(clock) - this.timeMs;
    const duration = Math.max(0, nominalDuration - driftMs);
    return [duration, nextKey];
  }

 
  
  
  static createValueKey(value) { return value; }
  setKeyValue(track) {
    // RÔLE DE RÉSOLUTION : la valeur-instruction est ré-évaluée à CHAQUE
    // franchissement (exec) — et SEULEMENT là : les goto (positionnement)
    // passent par setCss direct, une key jamais franchie garde sa valeur
    // d'initialisation. « Figée entre deux activations » tient par construction.
        //if (this.valueFc) this.value = String(this.valueFc.run());
    //  La key SE NOMME au rôle (numFrame, key) : le mémo lastFired des rôles
    //  ÉVÉNEMENTIELS en a besoin (étape 3 du bouclage, PD 23/08) — les autres rôles
    //  ignorent les deux derniers arguments.
    track.css.setCss(this.value, track, this.numFrame, this);
  }
  setTransition(track, duration, ease, delay=0) { track.css.transit(duration, ease, delay); }
  /**
   * Lance la transition vers this (keyNext) avec une durée imposée.
   * Utilisée par exec() (intervalle complet) et gotoPlay()/setIntervalExec()
   * (reprise en milieu de fenêtre : delayMs négatif).
   */
  execTransition(track, keyIndex, animMs, ease, delayMs = 0) {
    this.setTransition(track, animMs, ease, delayMs);
    this.setKeyValue(track);

    //  ⚠ Même garde qu'en exec (PD 2026-08-21) : la valeur posée peut être un bloc
    //  qui arrête le plateau. Ne pas armer la suite par-dessus sa décision.
    if (track.piece.ptClock?.frameStop != null) return;

    // delayMs peut être négatif (reprise au milieu de l'animation) :
    // animMs + delayMs = temps restant réel avant la fin de la transition.
    // Cible timeline = this.timeMs (this est la key d'ARRIVÉE de la transition).
    // this = key d'ARRIVÉE (objet stable) → le timer re-tire SA key, robuste à la mutation.
    const key = this, keyFrame = this.numFrame;
    track.waitTransition(() => { key.exec(track, keyIndex, keyFrame); },
                       animMs + delayMs, this.timeMs);
  }
  exec(track, keyIndex, keyFrame) {
      // ── Vérif au TIR : la table keys[] a-t-elle bougé pendant l'attente ? ──
      keyIndex = track.resolveKeyIndex(keyIndex, keyFrame);
      if (keyIndex < 0) return;                                   // key disparue → re-sync déjà fait
      const key = track.keys[keyIndex];
      if (key !== this) return key.exec(track, keyIndex, keyFrame);  // key REMPLACÉE à cette frame → tire la bonne

      track.keyIndex   = keyIndex;
      track.lastTreated = keyIndex;      // la case est TRAITÉE (borne du rattrapage)
      const [duration, nextKey] = this.nextKeySync(track, keyIndex);

      if (track.css?.transit) track.css.transit(0);
      this.setKeyValue(track);

      //  ⚠ L'ACTION A PU CHANGER LE COURS DU TEMPS (PD 2026-08-21) : la valeur qu'on
      //  vient de poser peut être un BLOC qui appelle `$stop()`, `$gotoStop()`… —
      //  auquel cas gotoStopGroup() vient de couper les timers de TOUTES les pistes.
      //  Ré-armer ici le ferait par-dessus sa décision, et laisserait un plateau à
      //  la fois marqué stoppé et tournant (même défaut que gotoPlayGroup() étape 4 /
      //  onLoopRestart(), corrigés le même jour ; symptôme mesuré en console : une key
      //  tirée 282 fois malgré `frameStop` posé).
      if (track.piece.ptClock?.frameStop != null) return;

      if (duration < 0) return;

      const tr = track.getTransition(nextKey, keyIndex, duration);
      if (!tr) {
          const ahead = track.arrivalAheadMs(nextKey, duration);      // F-4 : l'effet d'arrivée de la key suivante commence AVANT elle
          track.waitInterval(() => { nextKey.exec(track, keyIndex + 1, nextKey.numFrame); }, duration - ahead, nextKey.timeMs - ahead);
          return;
      }
      track.setIntervalExec(tr[0], tr[1], duration, keyIndex, nextKey);
  }
}
class TsiKeyFace extends TsiKey{

  constructor(numFrame, faceId) {
    super(numFrame);
    this.setValue(faceId);
  }
  /**
   * Arrivée sur une key face en LECTURE : l'EFFET D'ARRIVÉE de la key (sinon piste → Pièce → appli), avec son process
   * (`<20:_io_,fade>` devant la frame, ou `!<20:_io_,fade,2>` en tête de piste) — comme toute piste, par
   * track.arrivalEffect (P-2, PD 05/10 : « aligne &face sur les autres pistes »). Les SAUTS (gotoPlay/gotoStop) arment le
   * même effet par TsiCssFace.snapAuGoto. (Avant P-2 : lu dans l'INTERPOLATION de la key précédente, durée = l'intervalle,
   * jamais aux sauts — forme d'avant E-2.)
   */
  exec(track, keyIndex, keyFrame) {
    keyIndex = track.resolveKeyIndex(keyIndex, keyFrame);
    if (keyIndex < 0) return;
    if (track.keys[keyIndex] !== this) return track.keys[keyIndex].exec(track, keyIndex, keyFrame);
    track.css.armArrival(track, this.numFrame, false);
    super.exec(track, keyIndex, keyFrame);
  }
}

class TsiKeySpatial extends TsiKey {
  constructor(numFrame, value, prop) {
    super(numFrame);
    this.setValue(value);
    this.prop  = prop;
  }
}

class TsiKeyPos extends TsiKeySpatial{ 
    constructor(numFrame, value) { super( numFrame, value, "pos"); }}

class TsiKeyCss extends TsiKey {
  constructor(numFrame, value, prop) {
    super(numFrame);
    this.prop  = prop;
    this.setValue(value);
  }
}

class TsiKeyBgColor extends TsiKeyCss {
  constructor(numFrame, value) {super(numFrame, value, "bgColor");}
}

/**
 * Key de la piste clock — action sur l'horloge du plateau.
 * Valeurs : null = neutre (pseudo-key) ; 1 (STOP) = stop du plateau à cette frame.
 *
 * L'action n'est appliquée que par exec() — franchissement de la key en
 * LECTURE. Jamais par setKeyValue() (positionnement gotoPlay/gotoStop) :
 * sinon un restart depuis la frame du stop re-stopperait immédiatement.
 * Le stop se fait sur this.numFrame (frame exacte), pas sur l'heure du timer.
 */
class TsiKeyClock extends TsiKey{
  //  LA KEY D'HORLOGE EST UNE KEY COMME LES AUTRES (2026-08-13) : sa valeur est
  //  une TsiVal, plus un nombre nu. Avant, le ctor DÉTRUISAIT la réification
  //  (`value = value.get()`) et ramenait 1 / "1" / "stop" à la constante
  //  `TsiKeyClock.STOP = 1` — d'où un nombre magique confondable avec une frame,
  //  et un SECOND émetteur d'export (clockTrack) incapable d'appeler le chemin
  //  commun. Désormais : TSI_STOP, singleton, testé par IDENTITÉ.
  //
  //  Le mot `stop` n'est reconnu QU'ICI : la grammaire reste locale à l'horloge —
  //  ailleurs, `stop` est un appel de fonction ou un texte ordinaire.
  //  Une key VIDE (`0:;` — borne de durée) garde sa valeur null.
  constructor(numFrame, value, params) { super(numFrame); this.setValue(value); }
  setValue(value) {                                         // la valeur d'horloge se TRANSFORME : 1 / "1" / "stop" → TSI_STOP
    const brut = value?.constructor?.isTsiValue ? value.get() : value;
    this.value = (brut === 1 || brut === "1" || brut === "stop") ? TSI_STOP : value;
  }
  setKeyValue(track) { /* positionnement : aucune action */ }
  exec(track, keyIndex) {
    track.keyIndex = keyIndex;
    // STOP tiré au FRANCHISSEMENT, sauf en reprise pile sur ce stop (frameStop === F) :
    // sinon repartir d'un plateau stoppé le re-bloquerait. Garde : frameStop ≠ F.
    if (this.value === TSI_STOP && track.frameStop !== this.numFrame) {
      track.gotoStopGroup(this.numFrame); return;
    }

    const [duration, nextKey] = this.nextKeySync(track, keyIndex);
    if (duration < 0) return;
    track.waitInterval(() => { nextKey.exec(track, keyIndex + 1, nextKey.numFrame); }, duration, nextKey.timeMs);
  }
}







//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________

//  ###########    ############        ######        #########      ####    #### 
//     ####        ####     ####      #########     ####    ####    ####   ####  
//     ####        ####     ####     ####   ####    ####            ####  ####   
//     ####        ############      ####   ####    ####            ########     
//     ####        ####   ####      #############   ####            ####  ####   
//     ####        ####    ####     ####     ####   ####    ####    ####   ####  
//     ####        ####     ####    ####     ####    #########      ####    #### 

// ═════════════════════════════════════════════════════════════
//  TRACK
// ═════════════════════════════════════════════════════════════

/*  ┌──────────────────────────────────────────────────────────────────────────┐
    │  HIÉRARCHIE DE LA FAMILLE TsiTrack     (conçu PD 20/08 — 3 étapes sur 4 FAITES)
    └──────────────────────────────────────────────────────────────────────────┘

    ✅ FAIT le 2026-08-20 — la famille passe de 21 classes de piste à 5 :
         TsiTrack · TsiTrackClock · TsiTrackPosBar/BarTop/Framing (tispiLayout).
       16 supprimées : 13 coquilles VIDES, plus Button/Face/OnTime dont le
       comportement a rejoint SON RÔLE (la classe Css) — activeKeyAt0, setInactive,
       snapAuGoto sur TsiCssBase, refusés ou remplacés par TsiCssButton /
       TsiCssFace / TsiCssOnTime. `trackFormat`, déclaré depuis longtemps et LU
       NULLE PART, est enfin consulté : c'est snapAuGoto. Aucun `instanceof` à
       rattraper (seul TsiTrackClock était testé par type, il subsiste).
       Mesuré : banc_hierarchie (21 verts) + transition_none, key_debuild,
       face_debuild, savedocument. ⚠ Node seulement — pas de contre-épreuve
       navigateur, et les bancs ne font pas tourner d'horloge réelle.
    ✅ FAIT aussi — LA DUALITÉ IN/OUT, désastucée. MESURE qui a corrigé l'analyse :
       la « jumelle » n'est PAS une redondance de rangement — c'est une VRAIE piste,
       avec son css donc son propre animate (mesuré : `css SÉPARÉ ? true`). Et c'est
       voulu : l'apparition et la disparition se RECOUVRENT (playOut met la face
       sortante en z-index -1 pendant que la suivante entre), d'où deux animates
       simultanés sur la même propriété, que `seize` fait cohabiter. Fusionner les
       keys aurait obligé la piste à porter css ET cssOut : aucun gain.
       CE QUI ÉTAIT l'astuce : deux pistes rangées dans deux collections parallèles,
       RÉ-APPARIÉES à chaque besoin par une recherche — deux fois par `prop`, une
       fois par `css.constructor.jsProp` (_matchInTrack), qui pouvait rendre une
       piste d'une AUTRE propriété écrivant le même jsProp, sans garantie d'unicité.
       LE GESTE : `track.out` — le lien est PORTÉ, posé au build par
       TsiFaceBuilder.finishOneTrack là où les deux pistes sont en main. Les trois
       recherches deviennent des lectures. Et la piste de sortie n'est plus créée
       qu'au token `out` (avant : une par piste de Face, jetée par placeTrack) ⇒
       la morte-née disparaît, et la FUITE DU REGISTRE avec, sans toucher au `put`
       (mesuré : 4 pistes inscrites dont 1 orpheline → 3, dont 0).
    ⏸ RESTE — l'étape 4 : la STRUCTURE en objet (TsiTrackStruct), plus bas. Elle a
       maintenant un contenu réel à déclarer : StructPiece ne connaît pas de sortie,
       StructFace en admet une. Reste aussi possible : le lien INVERSE (`out.in`)
       pour épargner à _matchInTrack sa recherche par identité — non fait, un seul
       champ suffit et deux pointeurs croisés se maintiennent.

    LE CONSTAT (PD) — deux axes de variation pour un seul héritage :
      · le RÔLE   : quelle propriété (pos, size, color, face, clock…)
      · le FORMAT : une zone, ou DEUX avec sa jumelle de sortie (piste de Face)
    L'héritage étant pris par le rôle, le format n'a pas d'axe — d'où l'impasse.

    LA MESURE qui débloque — le rôle est DÉJÀ un attribut : c'est la classe Css
    qui porte `static track = TsiTrackXxx` (tispiTracksCss.js), et le comportement
    vit dans le css COMPOSÉ. Les classes de piste ne portent donc presque rien :
      ne redéfinissent RIEN  → Opacity · Color · Border · Rotat · Size ·
                               VideoSynchro · Text          (7 coquilles vides)
      redéfinissent le PARCOURS → OnClick(ctor) · Button(activeKeyAt0) ·
                               Face(ctor+setInactive) · OnTime(ctor+gotoStop+
                               gotoPlay) · Clock(30 méthodes)
    Les 7 coquilles peuvent pointer sur TsiTrack nu : rien ne se perd, et AUCUN
    `instanceof` ne les teste (vérifié — seul TsiTrackClock est testé par type).

    LA FORME RETENUE (PD) — hériter selon ce que la piste FAIT, pas ce qu'elle
    anime : une piste ordinaire est un animate WAAPI ; une piste-RÈGLE intervient
    sur le franchissement, l'arrêt, l'activation.
      TsiTrack            rôle en attribut (static track + css composé)
      TsiTrackRule        ├─ RuleOnClick ├─ RuleOnTime ├─ RuleFace ├─ Clock
    ⚠ À TRANCHER : la position de TsiTrackFace — son setInactive en fait une
    règle, mais c'est le SEUL porteur du format à deux zones.

    CE QUE ÇA DÉBLOQUE :
      · l'axe format se libère (Face est déjà une classe pour une autre raison) ;
        les deux zones deviennent un champ, sans arbitrage avec le rôle ;
      · le BALAYAGE, point de départ du chantier : TsiTrackRuleFace DÉCLARE sa
        jumelle dans son messageComponents, comme TsiVar déclare ses attributs.
        Aujourd'hui TsiNode itère `[timeline, timelineOut]` en dur — la structure
        est énumérée par une classe qui n'est pas concernée (cf. le TODO du
        diffuseur dans tispiPiece.js) ;
      · la jumelle morte-née (créée par piste de Face, jetée par placeTrack faute
        de key `out`, mais restée INSCRITE au registre) disparaît avec la jumelle.
        ⚠ En attendant, ce trou est ouvert : correctif d'une ligne proposé —
        inscrire au PLACEMENT plutôt qu'à la naissance (le `put` sort du ctor).

    ⚠ INVERSION (PD, 20/08) — on GARDE la hiérarchie de RÔLE telle quelle, et c'est
    la STRUCTURE qui descend en attribut. Rien à migrer, et la structure devient une
    DONNÉE (lisible, comparable, vérifiable) au lieu d'un parcours codé.
    L'attribut n'est PAS une liste de noms (ce serait un tableau nommé) mais un OBJET
    à hiérarchie propre — la variante est déjà dans le nom :
        TsiTrackStruct
          ├─ TsiTrackStructPiece   pour les Pièces  (attrs · keys)
          └─ TsiTrackStructFace    pour les Faces   (attrs · keys · keysOut)
        …et d'autres héritiers si la structure évolue.
    LE PATRON EXISTE DÉJÀ : `initCss(CssClass)` → `this.css` (l.611) est le premier
    composé de la piste, avec sa propre hiérarchie ; `initStruct(StructClass)` →
    `this.struct` en est le calque. Ce serait le TROISIÈME composé (rôle hérité,
    css composé, structure composée).
    LE POINT DE DÉCISION EXISTE DÉJÀ ET EST DÉDOUBLÉ : `placeTrack` — Pièce en
    tispiBuild.js:861, Face en tispiBuild.js:961 (« CROCHET : pose (Pièce : timeline ;
    Face : in/out) »). Chaque builder y pose SA struct. Aucun test de type à écrire.
    MESURE — les 9 classes porteuses n'emploient que CINQ noms de champ, et chaque
    nom porte déjà son `kind` : attrs→'attr' · vars→'var' · keys→'key' ·
    value/array→'value' · tracks→'track'. La struct n'a donc rien à décrire d'autre
    que ses porteurs ; l'itération se déduit du type rencontré (tableau/Map/table/
    feuille). Les six messageComponents fondent en un seul, générique, qui interroge
    la struct — et cette déclaration EST la doc versionnée que réclame le TODO du
    diffuseur (tispiPiece.js), sans doc à tenir à côté.
    ⚠ À TRANCHER : la struct porte-t-elle SEULEMENT la déclaration de ses porteurs,
    ou aussi le GESTE (`track.messageComponents` déléguant à `this.struct`) ? Et
    sert-elle au seul balayage, ou devient-elle la référence unique que debuild,
    flush et la vue compressée consultent aussi ?
    ⚠ COÛT RÉEL de keysOut : 8 sites lisent `face.timelineOut` (placeTrack qui apparie
    les jumelles PAR PROP en tispiPiece.js:883, playOut, _cancelOut, inheritValues,
    et sa fabrication en tispiBuild.js:989). Une fois les deux zones dans le MÊME
    objet, l'appariement par prop s'évapore — et la jumelle morte-née avec.

    HORLOGE EN ATTRIBUT (PD, « pas urgent ») — TsiTrackClock pèse plus que ses
    onze frères réunis, mais 12 de ses 30 méthodes sont STATIQUES (createClock,
    mergeClock, plateClock, _distributeClock, addPieceToPlate, getTimeMs,
    getFrameNum…) : des SERVICES DE PLATEAU rangés sur une classe de piste, qu'une
    instance n'hérite jamais. Les 17 d'instance sont de la vraie règle de parcours
    (gotoPlayGroup, gotoStopGroup, setInactive, resyncPlateau, onLoopRestart).
    La coupe rendrait Clock du même ordre que OnTime, et rangerait les services du
    côté du plateau — là où ils agissent déjà (règle « horloge = Pièce »).
*/

// ═══ LE DÉBRAYAGE — TsiTrackClutch (étape C, 27/09) ══════════════════════════════
//  UNE par piste (`track.clutch`). Une piste porte DEUX animates : le PRINCIPAL,
//  `css._anim`, et l'OVERRIDE qui le remplace temporairement — entrée depuis le
//  défaut, overlay du goto, sortie de Face. Le débrayage ne concerne QUE la piste :
//  la Pièce, le plateau, l'horloge et les pistes sœurs restent synchronisés (PD 27/09).
//  Un seul override à la fois, pas de pile : seize() remplace le précédent,
//  release() rend toujours la main au principal, recalé sur l'horloge.
//  Ne connaît de WAAPI que cancel, pause et onfinish.
class TsiTrackClutch {
  constructor(track) {
    this.track    = track;
    this.override = null;          // l'animate qui gouverne à la place du principal
  }
  /** Débraye : installe `override`, suspend le principal selon `spec.suspend`
   *  ('pause' réversible | 'cancel' terminal) ; `spec.returnOn` : 'finish' = release
   *  automatique à la fin | 'never' | 'dismiss' = release par l'appelant. */
  seize(override, spec = {}) {
    const css = this.track.css;
    if (this.override && this.override !== override) this.override.cancel();   // remplace l'override
    if (css._anim) {                                                             // le principal cède la place
      if (spec.suspend === 'cancel') { css._anim.cancel(); css._anim = null; }
      else css._anim.pause();
    }
    this.override = override;
    if (spec.returnOn === 'finish') override.onfinish = () => this.release(override);
    return { dismiss: () => this.release(override) };
  }
  /** Ré-embraye : lâche l'override et remet le principal en lecture, recalé sur la frame de l'horloge. */
  release(override) {
    if (override && this.override !== override) return;                         // déjà remplacé ou annulé
    this.drop();
    const clock = this.track.piece?.ptClock;
    const f = clock ? TsiTrackClock.getFrameNum(clock) : 0;
    this.track._animSeek(f, true);
  }
  /** Lâche l'override SANS recaler : le contrôle explicite (seek, stop, play) reprend la main lui-même. */
  drop() {
    if (this.override) { this.override.cancel(); this.override = null; }
  }
  /** Un override FINI se retire lui-même (sans recalage ni annulation) — pour une piste sans animate principal (&face, P-3). */
  forget(override) { if (this.override === override) this.override = null; }
}

class TsiTrack{
    //  LA FORME D'UNE PISTE — déclarée UNE FOIS, ici, et nulle part ailleurs.
    //  Le ctor ne fait AUCUN travail : les keys sont posées par le fabricant
    //  (buildTrack, ou le builder au fil du flux), le css par initCss — il a
    //  besoin des keys, il ne peut donc pas naître ici.
    //
    //  ⚠ 2026-08-13 — TsiBuilder.allocTrack SUPPRIMÉE : elle instanciait par
    //  `Object.create(prototype)` (ctor NON exécuté) et recopiait cette liste de
    //  champs à la main. Contournement né quand le ctor prenait la TABLE PLATE et
    //  faisait le build ; le ctor a été réduit à l'identité, le contournement est
    //  resté — d'où DEUX déclarations de la même forme, divergentes (`macros`
    //  absent des deux, `css` posé après coup) : deux instances de la MÊME classe
    //  n'avaient pas la même forme. Règle : un ctor qui ne convient pas se MODIFIE.
    /**
     * 
     * @param {*} prop 
     * @param {*} piece 
     * @param {Array<TsiKey>} keys
     */
    constructor(prop, piece) {
        //  IDENTITÉ DE SESSION (exposition, PD 20/08) — la piste s'inscrit au registre
        //  comme tout nœud : c'est SON idUnic qui ancre les keys d'une vue compressée
        //  (« la key mémorise l'idUnic de la track — elle ne peut pas se tromper »).
        //  Le registre accepte tout composant : le pointeur porte sa table (TsiIdUnic).
        this.idUnic     = null;
        this.idUnic     = TsiPiece.piecesPt.put(this);
        this.prop       = prop;
        this.piece      = piece;
        this.keys       = [];
        this.keyIndex   = 0;
        //  ⚠  et , distincts de  (PD 2026-08-23) —
        //  keyIndex dit OÙ ON EST, et les goto le déplacent (resolveKeyIndex,
        //  _regoto, gotoStop). Ces deux-ci disent CE QUI A ÉTÉ EXÉCUTÉ, et n'avancent
        //  qu'au tir réel : ils bornent le rattrapage de fin de tour.
        //    lastTreated — index de la dernière key TRAITÉE
        //    lastFired   — numFrame de la dernière action onTime tirée (le mémo du
        //                  22/08, jusqu'ici posé au fil de l'eau dans TsiCssOnTime :
        //                  deux instances de la même classe n'avaient pas la même forme)
        this.lastTreated = -1;
        this.lastFired   = null;
        this.param      = null;
        this.mark        = null;                // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark) — type tracks : la PISTE appartient au paramètre — conversions seules, runtime aveugle
        this.markContent = null;                // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark) — type keys : le CONTENU (l'ensemble des keys) appartient au paramètre
        this.macros     = null;                 // PROVENANCE : pile [nom, target] copiée à la naissance (tispiBuild.js)
        this.effect        = null;              // l'EFFET d'apparition de chaque key, `!<durée:…>` en tête de piste
        this.interpolation = null;              // l'INTERPOLATION par défaut des intervalles, `!<…>` en tête de piste
        this.hideEffect = null;                 // l'EFFET de disparition, `!<durée:…>` après les keys — LU et ré-émis, joué à l'étape Face
        this._transitionTimer = null;
        this.clutch     = new TsiTrackClutch(this);   // le débrayage de CETTE piste (étape C, 27/09)
        this.attrs      = {};                   // ATTRIBUTS de piste (chantier exposition, PD 20/08) — `!<$$xl>` :
                                                //   même organe que TsiNode.attrs, posé par le futur dispatch des blocs
        //  MA PISTE DE SORTIE — une VRAIE piste (ses keys, sa transition, son css,
        //  donc son propre animate) qui joue la disparition pendant que l'entrée de
        //  la face suivante se recouvre. Posée par TsiFaceBuilder.finishOneTrack ;
        //  null partout ailleurs (une piste de Pièce n'a pas de sortie).
        //  ⚠ LE LIEN EST PORTÉ, PAS DEVINÉ (PD 20/08) — il remplace trois RECHERCHES
        //  par nom de prop dans une timeline parallèle. Voir le TODO en tête.
        this.out        = null;
        /** @type {CssClass} */
        this.css        = null;                 // posé par initCss, APRÈS la lecture des keys
    }
    /** Le css d'une piste — séparé du ctor parce qu'il vient APRÈS les keys. */
    initCss(CssClass) { this.css = new CssClass(this.piece); }

    //  MES PORTEURS : mes attributs (`!<$$xl>`) et mes keys — chacune visitant les
    //  siens. Contrat aveugle — cf. TsiVal.messageComponents.
    messageComponents(onComp) {
      for (const nom in this.attrs) {
        const a = onComp(this.attrs[nom], 'attr'); if (a && a !== 'continue') return a;
        const w = this.attrs[nom].messageComponents(onComp); if (w) return w;
      }
      //  MES TRANSITIONS de piste (`!<…>`) — traversées, comme celles d'une key : ce
      //  ne sont pas des composants, mais leur ease est une VALEUR.
      for (const tr of [this.effect, this.interpolation, this.hideEffect]) { const w = tr?.messageComponents?.(onComp); if (w) return w; }
      for (const k of this.keys ?? []) {
        const r = onComp(k, 'key'); if (r && r !== 'continue') return r;
        const w = k.messageComponents(onComp); if (w) return w;
      }
      //  MA PISTE DE SORTIE (Face) — atteinte aujourd'hui par timelineOut ; le lien
      //  porté la rend joignable même si cette collection disparaît un jour.
    }

    setMark(markName){ this.mark = markName; }   // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)
    // L'horloge n'est PAS stockée sur la piste : elle vit sur la PIÈCE. Toute piste
    // lit son horloge via `this.piece.ptClock` (cf. nextKeyfvSync, _animSeek, watcher…).
    setCssCurr(){
      // Une Face n'a pas de numéro de frame — son temps courant est 0 (décision PD
      // 2026-08-12). Si un jour elle en a un, ce sera par une fonction à elle.
      const frameNum = this.piece.isPiece ? this.piece._currentFrame() : 0;
      const key = this.keys[this.searchKey(frameNum)];
      if (key.numFrame !== frameNum) return;  // pas de key exacte → pas de setCss
      // frameNum et key sont TRANSMIS : les pistes d'action en font leur TsiCtx, et
      // les autres les ignorent — setCss(value, track) reste leur signature.
      this.css.setCss(key.value, this, frameNum, key);
    }
  /** Piste SYNTHÉTIQUE : UNE key à la frame donnée. Le data-tsi, lui, passe par
   *  TsiBuilder — `new CssClass.track(prop, piece)` puis lecture des keys ; il
   *  n'appelle PAS buildTrack. Quatre appelants, tous dans tispiPiece.js :
   *  setSize, face synthétisée, autoSize, faceInner — chercher `track.buildTrack(`.
   *  La valeur est posée TELLE QUELLE (brute ou réifiée) : ce qui la produit et
   *  ce qui la consomme sont hors de cette zone. TsiTrackClock surcharge (format
   *  !<durée, appel> distinct).
   *  2026-08-09 : l’analyseur de tableau — descripteur, transitions de tête,
   *  marqueurs de macro, keys multiples — est retiré : aucune des quatre entrées
   *  n’en portait. */
  buildTrack([, frame, value]) {
    const CssClass = o_.css[this.prop];
    this.keys.push(new CssClass.key(frame, value));
    TsiTrackClock.setPlateDurationTempo(frame + 1, this.piece);
    if (CssClass.defaultValue !== undefined)                    // pseudo-key -1 : keyCurr jamais null
      this.keys.unshift(new CssClass.key(-1, new TsiValConst(CssClass.defaultValue)));
    this.initCss(CssClass);                                     // EN DERNIER : le css a besoin des keys
  }
  //  DEBUILD — la piste écrit DANS le buffer, elle ne rend rien : tout ce qui
  //  atterrit dans data-tsi passe par ctx.dt, sans chaîne intermédiaire.
  //  Forme émise : `&prop !<effet> !<interpolation> frame:valeur; frame:valeur; !<disparition>`
  //  Chaque key se ferme par son `;` : il y a donc toujours un `;` avant `!<disparition>`.
  debuild(ctx)       { ctx.dt += '&' + this.prop; this.debuildConfig(ctx); this.debuildKeys(ctx);
                       if (this.hideEffect) ctx.dt += ' !' + this.hideEffect.debuild(); }

  //  NONE est une VRAIE instance (2026-08-15) : debuild() appelable, ré-émet `<>`
  //  → un `!<>` écrit revient `!<>`, le round-trip du NONE explicite tient.
  debuildConfig(ctx) { this.debuildAttrsBlock(ctx);
                       if (this.effect)        ctx.dt += ' !' + this.effect.debuild();
                       if (this.interpolation) ctx.dt += ' !' + this.interpolation.debuild(); }
  //  EN-TÊTE de piste `!<$$…>` (exposition, PD 20/08) — AVANT la transition, comme à
  //  la lecture ; chaque attribut s'écrit LUI-MÊME (TsiAttr.debuild). Partagé avec
  //  la config d'HORLOGE, qui surcharge debuildConfig sans passer par la mère.
  debuildAttrsBlock(ctx) {
    const noms = Object.keys(this.attrs);
    if (!noms.length) return;
    ctx.dt += ' !<';
    noms.forEach((n, i) => { if (i) ctx.dt += '; '; this.attrs[n].debuild(ctx); });
    ctx.dt += '>';
  }

  //  La pseudo-key -1 est SYNTHÉTIQUE (posée au build pour que keyCurr ne soit
  //  jamais null) : elle ne s'écrit pas. Chaque key est précédée d'UN espace —
  //  aucune relecture du buffer pour savoir s'il faut un séparateur.
  //  RECOLLAGE DES KEY-MACROS (script PD 2026-08-14) — même principe que les
  //  PISTES (TsiPiece.debuildTracks) : le nom s'écrit UNE fois, la boucle
  //  INDEXÉE consomme les keys contiguës de la même macro — contiguës par
  //  construction : nées dans UNE boucle de keys, une frontière `&` aurait
  //  relancé la boucle du dessus. Provenance : k.macros (snapshot du fabricant).
  /**
   * 
   * @param {*} ctx
   */
  debuildKeys(ctx) {
    /** @type {Array<TsiKey>} */
    const keys = this.keys;
    for (let i = 0; i < keys.length; i++) {          // boucle INDEXÉE : le recollage doit AVANCER
      const k = keys[i];
      if (k.numFrame < 0) continue;                  // pseudo-key -1, synthétique
      const macro = k.macros?.[0];                   // provenance : pile [nom, target], [0] = le plus extérieur
      if (macro && macro[1] === 0) {                 // macro de KEYS (target 0 — 1 = pistes)
        ctx.dt += ' ' + macro[0] + ';';              // le sigil vit dans le nom : `$m` stocké tel quel
        while (i + 1 < keys.length &&
               keys[i + 1].macros?.[0]?.[0] === macro[0]) i++;
        continue;
      }
      ctx.dt += ' '; k.debuild(ctx);
    }
  }
  
//____________________________________________________________________________
 

  /**
   * Annule les deux timers de la piste ET remet les champs à null.
   * Toujours passer par ici — un clearTimeout() seul laisse un id périmé
   * (truthy) dans _intervalTimer, que startSyncWatcher prend pour un
   * intervalle actif et ressuscite avec son callback périmé.
   */
  clearTimers() {
      clearTimeout(this._intervalTimer); this._intervalTimer = null; this._intervalTargetMs = null;
      clearTimeout(this._transitionTimer);      this._transitionTimer      = null; this._transitionTargetMs    = null;
  }

  // MESSAGE DE L'HORLOGE — la piste RELAIE, le RÔLE décide (TsiCssBase par défaut :
  // couper l'accompagnement + pauser l'animate ; TsiCssFace : la cascade à la place).
  setInactive() { this.css.setInactive(this); }

  // ══ insertFrames ══════════════════════════════════════════════════════════

  // PRÉDICTION (ne mute rien) : la dernière key NON VIDE >= P dépasse-t-elle la
  // longueur du plateau une fois décalée de +N ?
  keyOutOfLimit(P, N) {
    const len = this.piece.ptClock?.animDuration ?? this.piece.getAnimDuration();
    let last = null;
    for (let i = this.keys.length - 1; i >= 0; i--)
      if (!this.keys[i].isEmpty()) { last = this.keys[i]; break; }
    if (!last || last.numFrame < P) return false;
    return last.numFrame + N > len;
  }

  // Décision UI partagée par les 3 portées quand un débordement est constaté.
  // 0 = refus, 2 = suppressions (flag 1 → 2 : suppression silencieuse).
  static decideOverflow(flagLenFixe) {
    if (flagLenFixe == 2) { TsiError.info("Key move out of limits of timeline, refused"); return 0; }
    if (flagLenFixe == 3 &&
        TsiError.request("Key move out of limits of timeline, do you want suppress it", "yes", "no") !== 1)
      return 0;
    return 2;
  }

  //  LE RATTRAPAGE (étape 2 du bouclage, PD 2026-08-23) — la coupure de fin de tour
  //  (premier-fini) peut laisser des keys NON VISITÉES entre la dernière servie
  //  (keyIndex) et la fin du plateau : leurs actions immédiates doivent tirer —
  //  &onTime, un `$stop()` inscrit par fonction. SÉMANTIQUE seulement, pas de rendu
  //  (le fill tient la scène). Le mémo lastFired dédouble si la chaîne avait déjà
  //  tiré. Bouche aussi un trou ANTÉRIEUR : le timer pendu vers la dernière key,
  //  tué par les clearTimers du redémarrage.
  rattrape(finFrame) {
    //  ⚠ BORNÉ PAR lastTreated, PAS par keyIndex (PD 2026-08-23) : keyIndex est
    //  déplacé par les goto — il dirait « déjà passé » là où rien n'a été exécuté,
    //  et les actions de fin de tour seraient SAUTÉES.
    for (let i = this.lastTreated + 1; i < this.keys.length; i++) {
      const k = this.keys[i];
      if (k.numFrame > finFrame) break;
      this.keyIndex    = i;
      this.lastTreated = i;
      k.setKeyValue(this);
    }
  }

  // Re-projection de la piste à la frame courante, en CONTINUITÉ de l'état du
  // plateau : stoppé → gotoStop, en lecture → gotoPlay. Ne record jamais (dérivé pur).
  _regoto() {
    const clock = this.piece.ptClock;
    if (!clock || clock.frameStop === -1) return;            // plateau inactif : rien à projeter
    const F = TsiTrackClock.getFrameNum(clock);
    if (clock.frameStop == null) this.gotoPlay(F); else this.gotoStop(F);
  }

  // ATOME GÉNÉRIQUE : RÉDUIT la piste à UNE valeur, constante sur toute sa durée.
  // La piste n'anime plus. C'est une piste NEUVE qui prend la place de l'ancienne
  // dans la timeline (setTrack replace : il annule l'animate de l'ancienne, la
  // retire, et LA REND) — et l'ancienne, ENTIÈRE, devient la mémoire de l'undo.
  // ⚠ Mémoriser la PISTE et non ses seules keys (PD) : l'EFFET D'APPARITION vit
  //   sur la pseudo-key -1, dans son champ `transition` (cf. _armEntrance) ; la
  //   transition de piste et les macros vivent sur la piste. Un aller-retour les
  //   rend tous intacts.
  // `undo` (défaut true) : enregistre la restauration comme inverse. false =
  // réduction technique, pile d'undo intacte.
  // Undo sur plusieurs réductions successives remonte de valeur en valeur ; l'undo
  // de la PREMIÈRE rend la piste animée d'origine.
  // @returns {TsiTrack} la piste neuve — `this` est désormais hors timeline.
  // Usage : le DRAG fige `pos` à la position lâchée (TsiDrag._release).
  reduceToValue(value, undo = true) {
    const Css   = o_.css[this.prop];
    const neuve = new Css.track(this.prop, this.piece);
    neuve.buildTrack([this.prop, 0, value?.constructor?.isTsiValue ? value : new TsiValConst(value)]);
    const memo = this.piece.timeline.setTrack(neuve, true);   // pose la neuve, REND l'ancienne
    if (undo && typeof TsiUndo !== 'undefined')
      TsiUndo.record(() => {                                  // undo = LA PISTE D'AVANT, entière
        this.piece.timeline.setTrack(memo, true);
        memo.css._anim?.cancel(); memo.css._anim = null;      // flush : le rebuild appartient aux goto
        memo._regoto();
      });
    neuve._regoto();
    return neuve;
  }

  // ATOME : décale les keys >= from de delta (liste triée conservée : même delta
  // pour toutes), flushe l'animate (le rebuild appartient aux goto), se re-projette.
  // Undo = décalage inverse. Édition et rejeu font la même chose.
  _shift(from, delta) {
    let touched = false;
    for (const k of this.keys) if (k.numFrame >= from) { k.numFrame += delta; touched = true; }
    if (!touched) return false;
    this.css._anim?.cancel(); this.css._anim = null;
    if (typeof TsiUndo !== 'undefined')
      TsiUndo.record(() => this._shift(from + delta, -delta));
    this._regoto();
    return true;
  }

  // Décalage pur : la piste est préparée (scan fait en amont) pour ne pas déborder.
  _insertFrames(P, N) { this._shift(P, N); }

  // Longueur fixe : supprime les keys non vides qui déborderaient (aux frames
  // d'origine → undo = ré-insertion exacte), PUIS décale les survivantes.
  _insertFramesSuppr(P, N) {
    const len = this.piece.ptClock?.animDuration ?? this.piece.getAnimDuration();
    for (let i = this.keys.length - 1; i >= 0; i--) {
      const k = this.keys[i];
      if (!k.isEmpty() && k.numFrame >= P && k.numFrame + N > len)
        this.deleteKey(k.numFrame);
    }
    this._shift(P, N);
  }

  // PORTÉE 1 PISTE. Flag 0 : allonge le temps de TOUT le plateau (règle générale).
  insertFrames(P, N, flagLenFixe = 0) {
    if (flagLenFixe == 0) {
      this.piece.setPlateDuration((this.piece.ptClock?.animDuration ?? this.piece.getAnimDuration()) + N);
    } else if (this.keyOutOfLimit(P, N)) {
      switch (TsiTrack.decideOverflow(flagLenFixe)) {
        case 0: return false;
        case 2: this._insertFramesSuppr(P, N); return true;
      }
    }
    this._insertFrames(P, N);
    return true;
  }

  // ══ KEYS — pose et remplacement ═════════════════════════════════════════
  //  Déplacées de o_.functions le 2026-08-11 : elles prenaient la piste en 1er
  //  argument, donc c'étaient des méthodes qui n'avaient pas trouvé leur classe.
  //  Toujours accessibles à l'auteur dans ses propres fonctions — `track.insertKey(…)`
  //  au lieu de `o_.functions.insertKey(track, …)`, et découvrable sur l'objet.

  /** ATOME : insère un OBJET-key déjà bâti sur une case VIDE (position triée).
   *  Dépose son inverse = supprimer. Mutation + record seuls. @returns l'index posé. */
  insertKeyRaw(frame, key) {
    let at = this.keys.findIndex(k => k.numFrame > frame);
    if (at < 0) at = this.keys.length;
    this.keys.splice(at, 0, key);
    this.css._anim?.cancel(); this.css._anim = null;   // flush : le rebuild appartient aux goto
    this._regoto();
    if (typeof TsiUndo !== 'undefined')
      TsiUndo.record(() => this.deleteKey(frame));              // inverse = supprimer
    // Règle A CONTINUE (PD) : une key posée AU-DELÀ de la durée = intention
    // d'ALLONGER (jamais de refus) — via l'atome setPlateDuration (undo + re-projection).
    const clock = this.piece?.ptClock;
    if (clock && frame + 1 > clock.animDuration) this.piece.setPlateDuration(frame + 1);
    return at;
  }

  /** ATOME (le FLUSH) : retire la key à `frame`, capture l'objet retiré (valeur +
   *  PROVENANCE) et dépose son inverse = le remettre tel quel. AUTO-PROJETANT :
   *  mutation + flush de l'animate (le rebuild appartient aux goto) + _regoto.
   *  Édition et rejeu d'undo font la même chose. @returns index retiré, ou -1. */
  deleteKey(frame) {
    const at = this.keys.findIndex(k => k.numFrame === frame);
    if (at < 0) return -1;
    const removed = this.keys[at];                    // objet-key exact (provenance comprise)
    this.keys.splice(at, 1);
    this.css._anim?.cancel(); this.css._anim = null;  // flush : le rebuild appartient aux goto
    this._regoto();
    if (typeof TsiUndo !== 'undefined')
      TsiUndo.record(() => this.insertKeyRaw(frame, removed));   // inverse = remettre l'objet
    return at;
  }

  /** Insère (ou remplace) une key, triée. COMPOSITE PUR : flush l'occupant
   *  (deleteKey) puis insertKeyRaw sur case vide. La re-projection est faite par
   *  les ATOMES — aucune réconciliation ici. @returns l'index de la key posée. */
  insertKey(frame, value) {
    const KeyClass = this.css.constructor.key;
    const key      = new KeyClass(frame, KeyClass.createValueKey(value), this.prop);
    // PAS de bornes de transaction ici : elles se posent au niveau du GESTE d'édition
    // (clic, drag, élastique) ou de l'action programmée. Les atomes déposent leur
    // inverse dans la transaction OUVERTE par ce geste.
    if (this.keys.findIndex(k => k.numFrame === frame) >= 0) {   // occupée → remplacement
      TsiError.debug(`insertKey : key déjà présente au temps ${frame} sur &${this.prop} → remplacée.`);
      this.deleteKey(frame);
    }
    return this.insertKeyRaw(frame, key);
  }

  // ══ setFrameLength ══════════════════════════════════════════════════════

  // PRÉDICTION (ne mute rien) : la dernière key NON VIDE dépasse-t-elle len ?
  // (une key à exactement len est tolérée — même convention que keyOutOfLimit)
  keyBeyond(len) {
    for (let i = this.keys.length - 1; i >= 0; i--)
      if (!this.keys[i].isEmpty()) return this.keys[i].numFrame > len;
    return false;
  }

  // Supprime les keys NON VIDES au-delà de len (undo = ré-insertion exacte).
  _supprBeyond(len) {
    for (let i = this.keys.length - 1; i >= 0; i--) {
      const k = this.keys[i];
      if (!k.isEmpty() && k.numFrame > len)
        this.deleteKey(k.numFrame);
    }
  }

  // ══ supprFrames ═════════════════════════════════════════════════════════

  // PRÉDICTION (ne mute rien) : une key NON VIDE dans la zone [P, P+N) ?
  keyInZone(P, N) {
    return this.keys.some(k => !k.isEmpty() && k.numFrame >= P && k.numFrame < P + N);
  }

  // Décision UI partagée par les 3 portées quand la zone contient des keys.
  // 0 = refus, 2 = suppression (0/1 → silencieux, 2 → refus, 3 → demande).
  static decideSuppr(flagSuppr) {
    if (flagSuppr == 2) { TsiError.info("Keys in the removed zone, suppression refused"); return 0; }
    if (flagSuppr == 3 &&
        TsiError.request("Keys in the removed zone will be deleted, continue", "yes", "no") !== 1)
      return 0;
    return 2;
  }

  // CŒUR (unique) : supprime les keys NON VIDES de la zone (aux frames d'origine →
  // undo = ré-insertion exacte), PUIS referme la zone (_shift -N des keys >= P+N).
  // Undo LIFO : dé-décalage d'abord, ré-insertions ensuite — restauration exacte.
  _supprFrames(P, N) {
    for (let i = this.keys.length - 1; i >= 0; i--) {
      const k = this.keys[i];
      if (!k.isEmpty() && k.numFrame >= P && k.numFrame < P + N)
        this.deleteKey(k.numFrame);
    }
    this._shift(P + N, -N);
  }

  // PORTÉE 1 PISTE. Raccourcit le temps de TOUT le plateau (miroir d'insertFrames).
  // setPlateDuration en DERNIER : pendant les mutations, les regotos intermédiaires
  // reconstruisent avec l'ANCIENNE longueur — toutes les keys y tiennent encore.
  supprFrames(P, N, flagSuppr = 0) {
    const len = this.piece.ptClock?.animDuration ?? this.piece.getAnimDuration();
    if (P + N > len) N = len - P;                      // zone au-delà de la fin → jusqu'à la fin
    if (N <= 0) return false;
    if (flagSuppr > 0 && this.keyInZone(P, N) && TsiTrack.decideSuppr(flagSuppr) === 0)
      return false;
    this._supprFrames(P, N);
    this.piece.setPlateDuration(len - N);
    return true;
  }
  // MESSAGE DE L'HORLOGE — la piste RELAIE, le RÔLE décide (TsiCssBase : se replacer
  // sur la key 0 ; TsiCssButton : REFUS, le redémarrage ne recrée pas le comportement souris).
  activeKeyAt0() { this.css.activeKeyAt0(this); }
//______________________________________
//______________________________________
  /**
   * Arme le timer d'intervalle avec bookkeeping pour startSyncWatcher.
   * @param {number} [targetMs] — position timeline (ms WAAPI) visée à l'échéance
   *   (timeMs de la key suivante, ou début de transition pour le cas 3).
   *   Indispensable : le timer peut être armé en MILIEU d'intervalle (gotoPlay),
   *   le watcher ne peut donc pas déduire la cible depuis la key courante.
   */
  waitInterval(callback, duration, targetMs = null) {
    clearTimeout(this._intervalTimer);
    this._intervalStart    = this.piece.ptClock?.nowMs() ?? Date.now();   // temps logique de l'horloge de la piste
    this._intervalDuration = duration;
    this._intervalCallback = callback;
    this._intervalTargetMs = targetMs;
    this._intervalTimer  = setTimeout(() => {
      this._intervalTimer = null;
      callback();
    }, duration);
  }
  /**
   * Arme le timer de fin de transition avec le même bookkeeping que
   * waitInterval — permet à startSyncWatcher de resynchroniser aussi
   * pendant une transition WAAPI (anim et timer décalés ensemble).
   * @param {number} [targetMs] — temps timeline (ms WAAPI) de la key d'arrivée
   */
  waitTransition(callback, duration, targetMs = null) {
    clearTimeout(this._transitionTimer);
    this._transitionStart    = this.piece.ptClock?.nowMs() ?? Date.now();   // temps logique de l'horloge de la piste
    this._transitionDuration = duration;
    this._transitionCallback = callback;
    this._transitionTargetMs = targetMs;
    this._transitionTimer    = setTimeout(() => {
      this._transitionTimer = null;
      callback();
    }, duration);
  }
  getKeyNext(keyIndex){
    return (keyIndex<this.keys.length-1)
        ? this.keys[keyIndex + 1]
        : null;
  }
  /**
    Synchronisation répétée toutes les 1 à 2 secondes
                1 - vérification de la synchro d'une piste avec l'horloge
                2 - principe : comparer le temps restant du timer à celui dicté par l'horloge
                                                                                        |<- temps_courant_horloge                    | durée_de_l_animation_du_groupe
                    Horloge ------------------------------------------------------------.............................................
                                                          |<- armement_du_timer       |<-  position_piste                  | cible (_intervalTargetMs)
                    Piste   ..............................~~~~~~~~~~~~~~~~~~~~~~~~~~~~??+++++++++++++++++++++++++++++++++++..........
                3 - horlogeMs         = TsiTrackClock.getTimeMs(ptClock)
                4 - restantTimerMs    = _intervalDuration - écoulé_depuis_l_armement
                    restantHorlogeMs  = _intervalTargetMs - horlogeMs
                5 - ecart /??/        = restantTimerMs - restantHorlogeMs
                6 - si |écart| ≤ 2 frames => on boucle sur la vérification suivante => quitter
                7/8 - réarmer waitInterval pour atteindre la cible au temps horloge /?? et +++/
                9 - => on boucle sur la vérification suivante
   */
  /**
   * RECALAGE (resync) — recale CETTE piste sur la position de son horloge, SANS
   * timer ni boucle : la piste n'est plus SOURCE de synchro (refonte master/slave).
   * Le déclencheur périodique vit sur l'horloge (`TsiTrackClock._armResync`), qui
   * redistribue via `resyncPlateau()` → `track.resync()`.
   *  - WAAPI single-animate : aligne `anim.currentTime` (mod durée) sur la position ;
   *  - piste discrète : re-arme `waitInterval`/`waitTransition` sur le temps horloge.
   */
  resync() {
    const clock = this.piece?.ptClock;
    if (!clock || clock.frameStop != null) return;     // pas d'horloge ou figé → rien à recaler
    const horlogeMs = TsiTrackClock.getTimeMs(clock);
    const seuilMs   = Tsi_.frameToMs(2);

    if (o_.singleAnim && this.css instanceof TsiCssAnimated && this.css._anim) {
      const anim  = this.css._anim;
      const durMs = anim.effect.getTiming().duration;
      if (durMs > 0 && anim.currentTime != null) {
        const animPos = anim.currentTime % durMs;
        let   drift   = horlogeMs - animPos;             // >0 : l'animate est en retard
        if (drift >  durMs / 2) drift -= durMs;
        if (drift < -durMs / 2) drift += durMs;
        if (Math.abs(drift) > seuilMs) anim.currentTime += drift;
      }
      return;
    }

    // Piste discrète : re-armer le timer (attente / transition) sur le temps horloge
    if (this._intervalTimer && this._intervalTargetMs != null) {
      const restantHorlogeMs = this._intervalTargetMs - horlogeMs;
      const restantTimerMs   = this._intervalDuration - (clock.nowMs() - this._intervalStart);
      if (Math.abs(restantTimerMs - restantHorlogeMs) > seuilMs)
        this.waitInterval(this._intervalCallback, Math.max(0, restantHorlogeMs), this._intervalTargetMs);
    } else if (this._transitionTimer && this._transitionTargetMs != null) {
      const restantHorlogeMs = this._transitionTargetMs - horlogeMs;
      const ecartMs          = (this._transitionDuration - (clock.nowMs() - this._transitionStart)) - restantHorlogeMs;
      if (Math.abs(ecartMs) > seuilMs) {
        this.css.nudge?.(ecartMs);
        this.waitTransition(this._transitionCallback, Math.max(0, restantHorlogeMs), this._transitionTargetMs);
      }
    }
  }
  searchKey(frame) {
    let keyIndex;
    if (frame === 0) {
      keyIndex = (this.keys.length > 1 && this.keys[1].numFrame === 0) ? 1 : 0;
    } else {
      let lo = 0, hi = this.keys.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (this.keys[mid].numFrame <= frame) lo = mid;
        else hi = mid - 1;
      }
      keyIndex = lo;
    }
    return keyIndex;
  }
  // Re-valide un index sur le numFrame ATTENDU — robuste à une mutation live des keys[]
  // (l'identité fiable d'une key = son numFrame, pas son index positionnel).
  //  · index encore bon             → le renvoie (O(1))
  //  · table décalée (insert/suppr) → re-cherche par numFrame
  //  · key disparue                 → re-synchronise la piste sur cette frame et renvoie -1
  resolveKeyIndex(keyIndex, keyFrame) {
    if (this.keys[keyIndex]?.numFrame === keyFrame) return keyIndex;
    const i = this.keys.findIndex(k => k.numFrame === keyFrame);
    if (i >= 0) return i;
    (this.piece.ptClock?.frameStop == null) ? this.gotoPlay(keyFrame)
                                            : this.gotoStop(keyFrame);
    return -1;
  }
  /**
   * Calcul pur — retourne les données de positionnement à `frame`.
   * Aucun effet de bord — ne modifie ni le DOM ni l'état de la piste.
   *
   * @param  {number} frame — position courante du playhead (frames)
   * @returns {{ key, keyIndex, keyNext, transitionMs, delayMs, transition, restantMs }}
   *          keyNext null si dernière key (transitionMs=0, delayMs=0, transition=null, restantMs=0)
   * ─── Variables (temps WAAPI, ms) ────────────────────────────────────────
   *   key        = keys[searchKey(frame)]      key courante
   *   keyNext    = keys[keyIndex + 1]          key suivante
   *   intervalMs = keyNext.timeMs - key.timeMs durée de l'intervalle
   *   restantMs  = keyNext.timeMs - frameMs    temps restant jusqu'à keyNext
   * ─── Cas 1 — sans transition ───────────────────────────────────────────
   *   key.interpolation (départ) est null (ou TsiTransition.NONE)
   *
   *   transitionMs = 0
   *   delayMs      = -1
   *   transition   = null
   * ─── Cas 2 — avec transition ───────────────────────────────────────────
   *   transitionMs = durée de la transition (t.duration, ou intervalle complet)
   *
   *   2a · hors fenêtre   restantMs > transitionMs
   *        delayMs    = -1
   *        transition = null
   *
   *   2b · dans la fenêtre   restantMs ≤ transitionMs
   *        delayMs    = transitionMs - restantMs   (≥ 0, avancement dans la fenêtre)
   *        transition = la transition de départ
   */
  gotoInfo(frame, keyIndex=null) {
    if (keyIndex === null) keyIndex = this.searchKey(frame);
    const key      = this.keys[keyIndex];
    const keyNext  = this.keys[keyIndex + 1] ?? null;
    if (!keyNext) 
        return { key, keyIndex, keyNext: null, transitionMs: 0, delayMs: 0, transition: null, restantMs: 0 };
  
    const intervalMs = keyNext.timeMs - key.timeMs;
    const restantMs  = keyNext.timeMs - Tsi_.frameToMs(frame);

    const tr           = this.getTransition(keyNext, keyIndex, intervalMs);
    const transitionMs = tr ? tr[1] : 0;
  
    const delayMs    = (transitionMs > 0 && restantMs <= transitionMs)
                         ? transitionMs - restantMs
                         : -1;
    const transition  = (delayMs >= 0) ? tr[0] : null;
  
    return { key, keyIndex, keyNext, transitionMs, delayMs, transition, restantMs};
  }
  /**
   * Fraction EASED de progression dans l'intervalle courant — float ∈ [0,1].
   *   0 = valeur de la key de DÉPART ; 1 = valeur de la key d'ARRIVÉE.
   * Dérivée de gotoInfo (fenêtrage durée/délai déjà résolu), ne dépend que de
   * l'easing. Hors fenêtre / snap / 1re key / dernière key → 0 (= départ).
   *
   * Usage : échantillonnage HORS-PLAYHEAD (maître/esclave, éditeur), sans DOM,
   * pour un lerp `a.value + pc * (b.value - a.value)`. NE retourne PAS la valeur.
   * Sur la dernière key (keyNext null) rend 0 : l'appelant doit garder ce cas
   * (cf. valueAt) car il n'y a pas de valeur d'arrivée à interpoler.
   * Suppose une transition sans delay propre ; sinon soustraire le lead initial.
   *
   * @param  {number} frame
   * @returns {number} pc ∈ [0,1]
   */
  getPercentInterval(frame) {
    return this._pcFromInfo(this.gotoInfo(frame));
  }
  /**
   * Fraction eased à partir d'un résultat gotoInfo déjà calculé.
   * Source UNIQUE de la formule pc (partagée par getPercentInterval et valueAt)
   * → pas de chemin d'intervalle divergent dans la piste.
   * @param {object} s — retour de gotoInfo
   * @returns {number} pc ∈ [0,1]
   */
  _pcFromInfo(s) {
    if (!s.transition) return 0;                  // hors fenêtre / snap → valeur de départ
    return s.transition.ease.get(s.delayMs / s.transitionMs);   // la courbe calcule elle-même
  }
  /**
   * Valeur INTERPOLÉE à `frame` — hors-playhead, sans DOM, sans toucher
   * l'affichage. Un seul gotoInfo : key/keyNext + fenêtrage + pc. Le lerp
   * spécifique au type de valeur est délégué au css (scalaire / tuple / snap).
   * Dernière key (keyNext null) → valeur finale telle quelle (rien à interpoler).
   * @param  {number} frame
   * @returns {*} valeur de la propriété à `frame`
   */
  valueAt(frame) {
    const s = this.gotoInfo(frame);
    if (!s.keyNext) return s.key.value;           // dernière key → valeur finale
    return this.css.lerp(s.key.value, s.keyNext.value, this._pcFromInfo(s));
  }
  /**
   * Positionne une piste à frame et lance la séquence.
   * Appelé avec keyIndex = searchKey(frame).
   *
   * 4 cas :
   *   1. keyNext null          → dernière key : snap, rien à armer
   *   2. keyNext sans transit  → waitInterval → keyNext.exec()
   *   3. dans le vide          → waitInterval(début transition) → keyNext.execTransition(duréeComplète)
   *   4. dans la transition    → keyNext.execTransition(duréeRestante) — direct, WAAPI ne demande pas de flush
   *
   * isFirstKey (keyIndex===0) : pas de fallback piste/Piece/page sur la transition.
   */
  gotoPlay(frame, keyIndex=null, skipSnap=false, appearing=false) {
    // PRISE EN MAIN souris (PD 2026-08-16) : posUnlock inhibe le temps sur la SEULE
    // piste `pos` de CETTE pièce — le drag écrit le style inline, aucun goto ne le
    // recouvre. Point de passage unique : cascade d'horloge, _regoto, changement de
    // face et setSize aboutissent tous ici.
    if (this.prop === 'pos' && this.piece.posUnlock) return;
    // (La piste n'arme plus de watcher : le recalage périodique est piloté par
    //  l'horloge du plateau — TsiTrackClock._armResync → track.resync().)
    // P3c — piste WAAPI single-animate : seek + play l'animate unique
    // (l'entrée est dans les keyframes via buildKeyframes, pas ici).
    if (o_.singleAnim && this.css instanceof TsiCssAnimated) {
      if (this._armGoto(frame, true, null, appearing)) return;   // fondu d'arrivée (transition)
      this._animSeek(frame, true); return;          // sinon snap+play (actuel)
    }

    const s = this.gotoInfo(frame, keyIndex);

    // Mettre à jour keyIndex avant setKeyValue() : setCss.def en a besoin (ex. frameNum)
    this.keyIndex = s.keyIndex;

    // ── ENTRÉE (overlay) : à frame 0, si la pseudo-key -1 porte une transition,
    //    animer défaut → key0 par-dessus. Mécanisme = snap du défaut, puis transit
    //    + setKeyValue(key0) → setCss capture from=défaut et lance animate.
    //    La timeline continue ; une transition key0→key1 plus courte écrase
    //    l'entrée (responsabilité du concepteur — utile surtout avec stop sur key0).
    const ent = this._entrance(frame, s.keyIndex);
    if (ent) {
        this.css.transit(0);
        this.keys[s.keyIndex - 1].setKeyValue(this);      // snap au défaut (pseudo-key)
        this.css.transit(ent.durMs, ent.ease, ent.delayMs);
        s.key.setKeyValue(this);                          // animate défaut → key0
    }
    // Snap seulement si : pas d'entrée, et (pas de transition active OU skipSnap=false),
    // et si le RÔLE l'accepte — un rôle ÉVÉNEMENTIEL refuse de re-tirer un passé.
    else if ((!s.transition || !skipSnap) && this.css.snapAuGoto(this, s, frame, appearing)) {
        if (this.css?.transit) this.css.transit(0);
        s.key?.setKeyValue(this);
    }
    // Cas 1 — dernière key : la valeur est posée, rien à armer
    if (s.keyNext == null) return;

    if (!s.transition) {
        const ahead = this.arrivalAheadMs(s.keyNext, s.restantMs);     // F-4 : l'effet d'arrivée de la key suivante commence AVANT elle
        this.waitInterval(() => { s.keyNext.exec(this, s.keyIndex + 1, s.keyNext.numFrame); }, s.restantMs - ahead, s.keyNext.timeMs - ahead);
        return;
    }
    const tMs = skipSnap ? s.restantMs : s.transitionMs;
    this.setIntervalExec(s.transition, tMs, s.restantMs, s.keyIndex, s.keyNext);
  }
  /**
   * Transition d'ENTRÉE (overlay) : à frame 0, la pseudo-key -1 porte la
   * transition « &prop <…> » qui fait apparaître progressivement la 1ère valeur.
   * @returns {{durMs, ease, delayMs} | null}
   */
  _entrance(frame, keyIndex) {
    if (frame !== 0 || keyIndex < 1 || !this.css?.transit) return null;
    const pseudo = this.keys[keyIndex - 1];
    if (!pseudo || pseudo.numFrame !== -1) return null;
    const t = pseudo.interpolation;
    if (!t || t === TsiTransition.NONE) return null;
    return {
      durMs:   (t.duration != null) ? Tsi_.frameToMs(t.duration) : Tsi_.frameToMs(1),
      ease:    t.ease,
      delayMs: Tsi_.frameToMs(t.delay ?? 0)
    };
  }
  /**
   * P3c — seek l'animate unique à `frame`, puis play (true) ou pause (false).
   * Re-crée l'animate s'il est absent (ex. reprise après annulation).
   */
  _animSeek(frame, play) {
    // Contrôle explicite (seek/stop/play) → supersède un overlay d'entrée en
    // cours : on le lâche, le main reprend la main immédiatement à `frame`.
    this.clutch.drop();
    if (!this.css._anim) {
      const animFrames = this.piece.ptClock?.animDuration ?? this.piece.getAnimDuration();
      const loop = this.piece.ptClock?.loop ?? (this.piece.loop !== false);   // out → one-shot
      this.css.playTrack(this.keys, animFrames, loop, this.defaultInterpolation(), this.defaultEffect());
    }
    const a = this.css._anim;
    if (!a) return;
    // Poser la cible à l'activation : A a pu bâtir l'animate à cible nulle
    // (FTarget — Face pas encore sélectionnée). getTarget() est désormais résolu
    // (la piste `face` est jouée en premier). Ne jamais écraser par un null.
    const tgt = this.css.getTarget();
    if (a.effect && tgt) a.effect.target = tgt;
    //  ⚠ pause() AVANT currentTime (PD 2026-08-23 — VALIDÉ NAVIGATEUR, « c'était ça »).
    //  playTrack() vient peut-être de créer l'animate quelques lignes plus haut : il
    //  est alors 'play-pending', son startTime n'est PAS encore résolu (il le sera au
    //  prochain frame de rendu). Poser currentTime sur un animate pending n'y inscrit
    //  qu'un hold time provisoire, et pause() le fait passer 'pause-pending' : les
    //  deux résolutions ont lieu HORS de ce tick, et la position obtenue n'est pas
    //  celle qu'on croyait poser. pause() d'abord FIGE l'animate ; le positionnement
    //  qui suit ne peut plus bouger.
    //  ⚠ POURQUOI LE DÉCALAGE ATTEINT UNE FRAME ENTIÈRE (explication PD) : la fenêtre
    //  n'est pas fixe, elle dépend de la CHARGE du tick. Si le traitement en cours
    //  empiète de 10 ms sur les 16,7 ms intercalaires, il ne reste que 6,7 ms — et la
    //  résolution bascule au frame SUIVANT. C'est ce qui rendait le défaut
    //  intermittent : sur un clic COURT, le traitement du bouton était encore en
    //  cours et l'étoile se figeait une frame trop loin ; sur un clic LONG, le
    //  système s'était déchargé, la résolution tombait juste, la position était bonne.
    //  Au play, l'ordre inverse reste le bon : on positionne, PUIS on lance.
    if (play) { a.currentTime = Tsi_.frameToMs(frame); a.play(); }
    else      { a.pause(); a.currentTime = Tsi_.frameToMs(frame); }
  }
  //  seize() / release() — le DÉBRAYAGE a sa classe depuis l'étape C (27/09) : TsiTrackClutch, `this.clutch`.
  /**
   * Valeur de la DERNIÈRE key pleine, RÉSOLUE (règle `value.get`) — le fromValue
   * du goto de BOUCLAGE : déterministe, là où getCss() court contre le retour à 0 de
   * (snap vers key0) et lirait déjà key0. Sentinelles sautées ("" héritage,
   * undefined borne) ; null si aucune → l'appelant retombe sur getCss().
   */
  _lastKeyValue() {
    for (let i = this.keys.length - 1; i >= 0; i--) {
      const k = this.keys[i];
      if (k.numFrame < 0) continue;                        // pseudo-key -1
      if (k.value === undefined || k.value === "") continue;
      return k.value.get(this.piece);
    }
    return null;
  }
  /**
   * RELAIS D'ENTRÉE — instance de seize : overlay défaut → key0, suspend:'pause'
   * (le main reste vivant et clock-syncé), returnOn:'finish' (réintroduction du
   * main à la fin de l'overlay, re-calé sur l'horloge). No-op sans transition d'entrée.
   */
  _armEntrance() {
    const pseudo = (this.keys[0] && this.keys[0].numFrame === -1) ? this.keys[0] : null;
    if (!pseudo || !pseudo.interpolation || pseudo.interpolation === TsiTransition.NONE) return;
    const overlay = this.css.makeEntranceAnim(pseudo, this.keys[1]);
    if (!overlay) return;
    this.clutch.seize(overlay, { suspend: 'pause', returnOn: 'finish' });
  }
  /** Cascades des défauts : piste (-2) → élément (-3) → app (-4).
   *  L'« élément » est la Pièce OU la Face porteuse de la piste (this.piece). */
  defaultInterpolation() { return this.interpolation ?? this.piece?.interpolation ?? o_.interpolation ?? null; }
  defaultEffect()        { return this.effect        ?? this.piece?.effect        ?? o_.effect        ?? null; }
  /** Les keys JOUÉES par une piste de SORTIE (étape F-2) — dérivées au moment de jouer, jamais stockées.
   *  Le hideEffect part de la valeur COURANTE `from` et arrive, en sa durée D, sur la première key de sortie ;
   *  la section est décalée de D. Sans hideEffect ni section : les keys telles quelles. */
  hideKeys(from) {
    const h = this.hideEffect, K = this.css.constructor.key;
    const pseudo  = this.keys[0]?.numFrame === -1 ? this.keys[0] : null;
    const section = pseudo ? this.keys.slice(1) : this.keys;
    if (!h || h === TsiTransition.NONE || !section.length) return this.keys;
    const D = h.duration;
    const start = new K(section[0].numFrame, from);               // la valeur courante, là où la sortie commence à bouger
    start.interpolation = h;                                      // le hideEffect : sa durée, son accélération
    const decal = section.map(k => { const c = new K(k.numFrame + D, k.value); c.interpolation = k.interpolation; return c; });
    return pseudo ? [pseudo, start, ...decal] : [start, ...decal];
  }
  /** TRANSITION générique. Si la key à numFrame porte un effet d'apparition :
   *  overlay valeur courante (getCss) → key.value. Settle : play→release (rejoue),
   *  stop→onfinish custom (re-figé paused). @returns true si armé (l'appelant saute le snap). */
  //  L'EFFET D'ARRIVÉE sur la key à numFrame — UN seul endroit pour la cascade et le when, pour TOUTES les pistes (P-2, PD 05/10) :
  //  l'effet de la key, sinon celui de la piste → Pièce → appli (defaultEffect) ; puis le when de la transition retenue
  //  (PD) : 0 = sauf à l'apparition | 1 = uniquement à l'apparition | 2 = partout. @returns { key, t } ou null.
  arrivalEffect(numFrame, appearing = false) {
    const key = this.keys.find(k => k.numFrame === numFrame);
    if (!key) return null;                             // le défaut ne joue qu'à l'APPARITION D'UNE KEY
    const t = key.effect ?? this.defaultEffect();
    if (!t || t === TsiTransition.NONE) return null;
    const when = t.when ?? 0;
    if (when === 0 &&  appearing) return null;
    if (when === 1 && !appearing) return null;
    return { key, t };
  }
  /** F-4 (PD 15/10) : l'EFFET D'ARRIVÉE d'une key COMMENCE AVANT elle — départ = frame − durée, jamais avant la key courante ;
   *  la durée de l'effet ne change pas. Piste à process (&face, `armArrival`) : la key est TIRÉE à ce départ et son fondu finit sur
   *  sa frame. Les pistes CSS ont la même règle dans leurs keyframes (E-3). @returns l'avance en ms, bornée par l'intervalle restant. */
  arrivalAheadMs(keyNext, intervalMs) {
    const t = this.css?.armArrival ? this.arrivalEffect(keyNext.numFrame)?.t : null;
    return t?.duration != null ? Math.min(Tsi_.frameToMs(t.duration), intervalMs) : 0;
  }
  _armGoto(numFrame, play, fromValue = null, appearing = false) {
    const css = this.css;
    if (!css.getCss || !css.getTarget?.()) return false;   // pas de cible → pas d'overlay
    const r = this.arrivalEffect(numFrame, appearing);
    if (!r) return false;
    const { key, t } = r;
    // Défaut SANS durée = format « intervalle entier » — sans objet pour un SAUT :
    // refus net (snap), pas d'overlay 1-frame fantôme. Un goto explicite de key
    // sans durée garde son repli 1 frame (demandé, donc joué).
    if (!key.effect && t.duration == null) return false;
    // fromValue : départ capté PAR L'APPELANT (apparition de face : état à l'écran
    // AVANT construction du main — le fill du main snapperait déjà key0).
    const start = fromValue ?? css.getCss();          // valeur courante (lit l'overlay en cours si interruption)
    if (start == null) return false;
    const overlay = css.makeGotoAnim(start, key, t);
    if (!overlay) return false;
    if (play) {
      this.clutch.seize(overlay, { suspend: 'pause', returnOn: 'finish' });   // release → _animSeek(f,true) = play
    } else {
      this.clutch.seize(overlay, { suspend: 'pause', returnOn: 'dismiss' });
      overlay.onfinish = () => { this.clutch.drop(); this._animSeek(numFrame, false); };  // settle paused
    }
    return true;
  }
  gotoStop(numFrame, appearing = false) {
    if (this.prop === 'pos' && this.piece.posUnlock) return;   // PRISE EN MAIN souris — cf. gotoPlay
    this.clearTimers();

    // P3c — piste WAAPI single-animate : seek + pause (montre la frame figée).
    if (o_.singleAnim && this.css instanceof TsiCssAnimated) {
      if (this._armGoto(numFrame, false, null, appearing)) return;   // fondu d'arrivée (transition)
      this._animSeek(numFrame, false); return;      // sinon snap (actuel)
    }

    const s = this.gotoInfo(numFrame);
    this.keyIndex = s.keyIndex;

    // Pas de transition ou fin de piste → snap direct. Le snap est REFUSÉ par les
    // rôles ÉVÉNEMENTIELS (TrackFormat.EVENT) : un goto ne re-tire jamais un passé.
    if (!s.transition) {
      if (this.css?.transit) this.css.transit(0);
      if (this.css.snapAuGoto(this, s, numFrame, appearing)) s.key?.setKeyValue(this);
      return;
    }

    // 1 — snap sur fromValue (non peint, même tick)
    if (this.css?.transit) this.css.transit(0);
    s.key.setKeyValue(this);

    // s.delayMs = avancement (ms) dans la fenêtre de transition.
    // 0 → playhead exactement au départ de la transition : le snap suffit.
    if (s.delayMs === 0) return;

    // 2 — anim WAAPI armée à la position courante (même forme que setIntervalExec) :
    //     restantMs - animMs > 0 → encore dans la phase de délai (valeur = from)
    //     restantMs - animMs ≤ 0 → délai négatif, valeur interpolée à numFrame
    const animMs = s.transitionMs - Tsi_.frameToMs(s.transition.delay ?? 0);
    this.css.transit(animMs, s.transition.ease, s.restantMs - animMs);
    s.keyNext.setKeyValue(this);
    // 3 — lire valeur interpolée + geler (synchrone via getComputedStyle)
    this.freeze();
  }
  freeze() {
    const css = this.css;
    let frozen;
    if (css.constructor.domReadable) {
      if (!css.getCss) return;
      frozen = css.getCss();                                          // props simples : valeur affichée (DOM)
    } else {
      const clock = this.piece?.ptClock;
      if (!clock) return;
      frozen = this.valueAt(TsiTrackClock.getFrameNum(clock)); // rotation : calcul manuel
    }
    if (frozen == null) return;
    css.transit(0);
    css.setCss(new TsiValConst(frozen), null);   // frozen brut → réifié pour value.get()
  }
  setIntervalExec(t, tDurationMs, intervalMs, keyIndex, keyNext) {
    const delayMs = Tsi_.frameToMs(t.delay ?? 0);
    const animMs  = tDurationMs - delayMs;

    if (intervalMs > tDurationMs) {
      // Cas 3 — vide avant la transition : attendre, puis lancer avec délai complet.
      // waitInterval (et non setTimeout brut) : bookkeeping requis par startSyncWatcher.
      // Cible timeline = début de la fenêtre de transition.
      this.waitInterval(() => {
        keyNext.execTransition(this, keyIndex + 1, animMs, t.ease, delayMs);
      }, intervalMs - tDurationMs, keyNext.timeMs - tDurationMs);
      return;
    }
    // Cas 4 — dans la fenêtre de transition.
    //   intervalMs > animMs → dans le délai   : delay restant positif
    //   sinon               → dans l'animation : délai négatif, reprend la courbe ease au bon point
    // WAAPI : element.animate() capture le "from" via getComputedStyle dans setCss,
    // aucun flush rAF n'est nécessaire (contrairement aux CSS transitions).
    keyNext.execTransition(this, keyIndex + 1, animMs, t.ease, intervalMs - animMs);
  }
  getTransition(keyNext, keyIndex, intervalMs ) {
    if (!this.css?.transit) return null;

    // Departure-based : la transition de l'intervalle [key→keyNext] est
    // portée par la key de DÉPART (this.keys[keyIndex]), pas par keyNext.
    const keyInterp = this.keys[keyIndex].interpolation;
    const tRaw = (keyIndex === 0)
            ? keyInterp
            : (keyInterp ?? this.interpolation ?? this.piece.interpolation ?? o_.interpolation)
    const t = (tRaw === TsiTransition.NONE) ? null : tRaw;

    if (!t) return null;
    const tDurationMs = (t.duration !== null) ? Tsi_.frameToMs(t.duration) : intervalMs;
    return [t, tDurationMs];
  }

  /**
   * Met à jour la valeur d'une key existante et applique le CSS immédiatement.
   * La valeur est normalisée par key.constructor.createValueKey().
   */
  setValueKey(value, key) {
    key.value = key.constructor.createValueKey(value);
    this.css.setCss(key.value, this);
  }
}
/*
 IMPORTANT _ TODO
 Juste garder en tête, pour TsiTrackFace, 
 que l'éval au build + la validation « 1 instruction » 
 devront ré-apparaître dans TsiJs.get() / 
 la face quand on branchera l'aval.
 */
//  (TsiTrackFace SUPPRIMÉE le 2026-08-20 — son ctor n'appelait que super, tout son
//   corps était commenté, et son seul comportement — setInactive — a rejoint SON
//   RÔLE : TsiCssFace.setInactive (tispiCore.js). Une piste ne porte plus le
//   comportement de la propriété qu'elle anime.
//
//   NOTE DE CONCEPTION conservée — RÔLE DE RÉSOLUTION (PD) : une key à valeur-
//   INSTRUCTION (`0:prochaine();` — bloc capturé par _block, anonyme) est évaluée
//   à CHAQUE franchissement par le curseur temps (setKeyValue()), figée entre deux
//   activations. Miroir du motif onTime : k.str = provenance, buildAction =
//   compilation — ici le TsiFc produit une VALEUR (l'état) au lieu d'un effet.
//   Le corps commenté validait « une valeur = UNE instruction » au build ; c'est
//   ce que rappelle le TODO ci-dessus.)

//  (TsiTrackSpatial · TsiTrackPos · TsiTrackCss · TsiTrackBgColor SUPPRIMÉES le
//   2026-08-20 — quatre coquilles VIDES. Le rôle d'une piste n'est pas sa classe :
//   il est déclaré en ATTRIBUT par la classe Css (`static track`) et son
//   comportement vit dans le css COMPOSÉ. Leurs `static track` pointent désormais
//   sur TsiTrack. Voir le TODO en tête de TsiTrack.)









//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________

//        #########      ####         ########        #########     ####    ####    
//       ####    ####    ####        ####  ####      ####    ####   ####   ####   
//       ####            ####       ####    ####     ####           ####  ####    
//       ####            ####       ####    ####     ####           ########      
//       ####            ####       ####    ####     ####           ####  ####    
//       ####    ####    ####        ####  ####      ####    ####   ####   ####   
//        #########      #########    ########        #########     ####    ####  
//
//


// ═════════════════════════════════════════════════════════════
//  TRACKS CLOCK
// ═════════════════════════════════════════════════════════════
/**
 * pilote le temps et synchronise les Pieces
 */
class TsiClockService {
  static warn(message) {
    if (typeof TsiError !== 'undefined' && TsiError.warning)
      TsiError.warning(message);
    else
      console.warn(message);
  }
}

class TsiClockMasterService {
  constructor(track) {
    this.track = track;
    this.slaves = null;
    this._syncTimer = null;
  }

  getTimeMs() { return TsiTrackClock.getTimeMs(this.track); }
  nowMs()     { return this.track ? this.track.nowMs() : Date.now(); }   // temps logique (now) du maître
  getFrameNum() { return TsiTrackClock.getFrameNum(this.track); }
  getDurationFrames() { return this.track.animDuration; }
  getFrameStop() { return this.track.frameStop; }

  attachSlave(slave) {
    if (!(slave instanceof TsiClockSlaveService)) return false;
    const id = slave.track.piece.idUnic;
    this.slaves ||= [];
    if (!this.slaves.some(handle => handle?.uid === id.uid))      // idUnic = TsiIdUnic {uid, pos, table} — l'identité, c'est uid
      this.slaves.push(id);
    // LIAISON pure (init) : aucun timer ici. Le recalage périodique démarre quand
    // la clock joue (gotoPlayGroup() → startResync) ou, côté vidéo, sur l'event play.
    return true;
  }

  detachSlave(slave) {
    if (!this.slaves || !(slave instanceof TsiClockSlaveService)) return;
    const id = slave.track.piece.idUnic;
    this.slaves = this.slaves.filter(handle => handle?.uid !== id.uid);
    if (this.slaves.length === 0) {
      this.slaves = null;
      this.stopSyncWatcher();
    }
  }

  startSyncWatcher() {
    if (!this.slaves || this._syncTimer) return;
    this._armSyncWatcher();
  }

  stopSyncWatcher() {
    clearTimeout(this._syncTimer);
    this._syncTimer = null;
  }

  _armSyncWatcher() {
    const delay = Tsi_.synchroInterval + Math.random() * Tsi_.synchroIntervalMargin;
    this._syncTimer = setTimeout(() => {
      this._syncTimer = null;
      if (!this.slaves) return;
      this.onIntervalSync();
      this._armSyncWatcher();
    }, delay);
  }

  _eachSlave(fn) {
    if (!this.slaves) return;
    for (let i = this.slaves.length - 1; i >= 0; i--) {
      const piece = this.slaves[i].get(() => this.slaves.splice(i, 1));
      const slave = piece?.ptClock?.clockSlave;
      if (slave instanceof TsiClockSlaveService && slave.master === this) {
        fn(slave);
      } else {
        this.slaves.splice(i, 1);
      }
    }
    if (this.slaves.length === 0) {
      this.slaves = null;
      this.stopSyncWatcher();
    }
  }

  onGotoPlay(frame) {
    this._eachSlave(slave => slave.onMasterGotoPlay(frame));   // propage la position ; le TIMER vit sur l'horloge (clock) / le service (vidéo)
  }

  onGotoStop(frame) {
    this._eachSlave(slave => slave.onMasterGotoStop(frame));
  }

  onLoop() {
    this._eachSlave(slave => slave.onMasterLoop());
  }

  onIntervalSync() {
    this._eachSlave(slave => slave.onMasterIntervalSync());
  }

  onDetach() {
    this._eachSlave(slave => slave.onMasterDetach());
    this.slaves = null;
    this.stopSyncWatcher();
  }

  onSlaveGoto(slave, frame, play = null) {
    if (!this.track) return false;
    const targetFrame = frame ?? this.getFrameNum();
    if (play === true) this.track.gotoPlayGroup(targetFrame);
    else if (play === false) this.track.gotoStopGroup(targetFrame);
    else if (this.track.frameStop != null) this.track.gotoStopGroup(targetFrame);
    else this.track.gotoPlayGroup(targetFrame);
    return true;
  }

  onSlavePlay(slave, frame = null) {
    return this.onSlaveGoto(slave, frame, true);
  }

  onSlaveStop(slave, frame = null) {
    return this.onSlaveGoto(slave, frame, false);
  }

}

//  L'ÉLÉMENT MÉDIA est l'horloge (PD 06/10, ex-TsiVideoClockMasterService) : tout ce qui offre
//  currentTime, duration, paused, ended, play(), pause() et les événements play/pause/seeking/
//  seeked/loadedmetadata/ended — un <video>, ou le curseur <tsi-slider> qui l'imite. La piste
//  qui le CRÉE (&videoSynchro, &sliderSynchro) le passe au constructeur.
class TsiMediaClockMasterService extends TsiClockMasterService {
  constructor(face, media) {
    super(null);
    this.face = face;
    this.media = media;
    this._wiredMedia = false;
    this.domListeners = null;   // les six écouteurs du média (TsiDomListener, PD 06/10)
    this._wireMedia();
  }

  _wireMedia() {
    if (!this.media || this._wiredMedia) return;
    this._wiredMedia = true;
    // Le média EST l'horloge : c'est lui qui porte le timer de recalage (son
    // service), armé/coupé sur son état de lecture.
    TsiDomListener.add(this, this.media, 'play',  () => { this.onGotoPlay(this.getFrameNum()); this.startSyncWatcher(); });
    TsiDomListener.add(this, this.media, 'pause', () => { this.onGotoStop(this.getFrameNum()); this.stopSyncWatcher(); });
    TsiDomListener.add(this, this.media, 'seeking', () => this.onGotoStop(this.getFrameNum()));
    TsiDomListener.add(this, this.media, 'seeked', () => {
      if (this.media.paused) this.onGotoStop(this.getFrameNum());
      else { this.onGotoPlay(this.getFrameNum()); this.startSyncWatcher(); }
      this.onIntervalSync();
    });
    TsiDomListener.add(this, this.media, 'loadedmetadata', () => this.onIntervalSync());
    TsiDomListener.add(this, this.media, 'ended', () => { this.onGotoStop(this.getFrameNum()); this.stopSyncWatcher(); });
  }

  getTimeMs() {
    return this.media ? this.media.currentTime * 1000 : 0;
  }

  nowMs() { return this.media ? this.media.currentTime * 1000 : Date.now(); }   // temps logique = temps du média

  getFrameNum() {
    return Math.round(Tsi_.msToFrame(this.getTimeMs()));
  }

  getDurationFrames() {
    const d = this.media?.duration;
    return Number.isFinite(d) ? Tsi_.msToFrame(d * 1000) : 0;
  }

  getFrameStop() {
    if (!this.media || this.media.paused || this.media.ended)
      return this.getFrameNum();
    return null;
  }

  _seekFrame(frame) {
    if (!this.media || frame == null) return;
    const seconds = Math.max(0, Tsi_.frameToMs(frame) / 1000);
    this.media.currentTime = seconds;
  }

  _playMedia() {
    if (!this.media) return;
    const p = this.media.play();
    p?.catch?.(e => TsiClockService.warn("media play impossible : " + e));
  }

  onSlaveGoto(slave, frame, play = null) {
    if (!this.media) return false;
    this._seekFrame(frame);
    if (play === true) {
      this._playMedia();
    } else if (play === false) {
      this.media.pause();
    }
    return true;
  }

}

class TsiClockSlaveService {
  constructor(track) {
    this.track = track;
    this.master = null;
    this.offsetFrames = 0;
    this.offsetMs = 0;
    this.request = null;
    this.mode = 'once';          // fin de MA timeline : once = fixe, j'attends le goto du maître · repeat = je reboucle seul (N11-2)
  }

  //  LA FRAME DU MAÎTRE, LUE DANS MA PLAGE (N11-2, PD 08/10) : un esclave garde SA durée (celle de son contenu). `once` : au-delà
  //  de ma durée, c'est ma fin — mes animates tiennent leur dernière valeur. `repeat` : modulo ma durée.
  _localFrame(frame) {
    const f = frame - this.offsetFrames, D = this.track.animDuration;
    return (this.mode === 'repeat' && D > 1) ? ((f % D) + D) % D : f;
  }

  //  L'ESCLAVE DE FACE couvre son média (N11-2, PD 08/10) : seul esclave qui devient MAÎTRE (du plateau de scène), il doit
  //  pouvoir relayer toute frame du média — sa durée = FACE_SLAVE_SPAN + son contenu (2^37 : au-delà de tout film) ; l'export
  //  soustrait la constante (debuildConfig). Posé UNE fois, à l'attache.
  coverFace() {
    if (this.track.animDuration < TsiTrackClock.FACE_SLAVE_SPAN) this.track.animDuration += TsiTrackClock.FACE_SLAVE_SPAN;
  }

  requestMasterFromPieceParent(parentName, offsetFrames = 0) {
    this.request = {
      type: "pieceParent",
      parentName,
      offsetFrames: offsetFrames || 0
    };
  }

  requestMasterFromFace(offsetFrames = 0) {
    this.request = {
      type: "face",
      offsetFrames: offsetFrames || 0
    };
  }

  resolveAndAttach() {
    if (!this.request) return false;

    if (this.request.type === "pieceParent") {
      const masterPiece = this.track.piece.getNamedAncestor(this.request.parentName);
      if (!masterPiece) {
        TsiClockService.warn("clockMaster : Piece parent introuvable : " + this.request.parentName);
        return false;
      }
      return this.attachToMaster(masterPiece.ptClock, this.request.offsetFrames);   // passe la CLOCK (le service est créé dans attachToMaster)
    }

    if (this.request.type === "face") {
      const face = this.track.piece.getFaceCurr()?._tsiFace;
      if (!face) return false;   // pas de face courante → résolution DIFFÉRÉE à onShow (silencieux, pas une erreur)
      return this.attachToMaster(face.getClockMaster?.(), this.request.offsetFrames);
    }

    return false;
  }

  attachToMaster(master, offsetFrames = 0) {
    if (master instanceof TsiPiece)      master = master.ptClock;              // Pièce → sa clock
    if (master instanceof TsiTrackClock)                                       // clock → son service maître (créé si absent)
      master = (master.clockMaster ||= new TsiClockMasterService(master));
    if (master instanceof TsiCssMediaSynchro)                                  // piste média (vidéo, curseur) → son service, créé au premier esclave (S-1)
      master = (master.clockMasterService ||= new TsiMediaClockMasterService(master.pieceMaster, master.media));
    if (!(master instanceof TsiClockMasterService)) {
      TsiClockService.warn("clockSlave : service clockMaitre invalide.");
      return false;
    }
    if (master.track === this.track) {
      TsiClockService.warn("clockSlave : une piste clock ne peut pas etre esclave d'elle-meme.");
      return false;
    }
    for (let service = master; service?.track; service = service.track.clockSlave?.master) {
      if (service.track === this.track) {
        TsiClockService.warn("clockSlave : cycle detecte dans la dependance entre clocks.");
        return false;
      }
    }

    offsetFrames = offsetFrames || 0;
    if (this.master === master && this.offsetFrames === offsetFrames)
      return true;
    if (this.master) this.detachMaster();

    this.master = master;
    this.offsetFrames = offsetFrames;
    this.offsetMs = Tsi_.frameToMs(offsetFrames);
    if (this.request?.type === 'face') this.coverFace();   // esclave de FACE — le mot `face` de la synchro (!<face>), quel que soit le service maître (média, jauge…) : couvre la Face ; esclave de Pièce : SA durée (N11-2, PD)
    master.attachSlave(this);
    // LIAISON pure (init) : pas de syncFromMaster ici. Le calage de l'esclave
    // se fait quand le maître joue (onGotoPlay() → onMasterGotoPlay → gotoPlayGroup()).
    // SAUF si le maître joue DÉJÀ (média en lecture, branche tardive — M-1, 06/10) : le play est passé, il ne
    // reviendra pas → calage immédiat, sinon dateStart reste en temps machine et la frame lue est absurde.
    //  « joue » : pas de frame d'arrêt — et, pour une horloge de Pièce, déjà lancée (à l'init rien ne joue : liaison pure gardée).
    if (master.getFrameStop() == null && (master.track ? master.track.started : true)) this.onMasterGotoPlay(master.getFrameNum());
    return true;
  }

  detachMaster() {
    if (this.master) this.master.detachSlave(this);
    this.master = null;
    this.offsetFrames = 0;
    this.offsetMs = 0;
  }

  onMasterGotoPlay(frame) {
    if (this.track.frameStop === -1) return;              // désactivé → ne réagit pas
    this.track.gotoPlayGroup(this._localFrame(frame));
  }

  onMasterGotoStop(frame) {
    if (this.track.frameStop === -1) return;
    const targetFrame = this._localFrame(frame);
    if (this.track.frameStop !== targetFrame)
      this.track.gotoStopGroup(targetFrame);
  }

  onMasterLoop() {
    if (this.track.frameStop === -1) return;
    this.track.gotoPlayGroup(-this.offsetFrames);
  }

  onMasterIntervalSync() {
    if (this.track.frameStop === -1) return;
    this.syncFromMaster(false);
  }

  onMasterDetach() {
    this.detachMaster();
  }

  gotoMaster(frame, play = null) {
    return this.master?.onSlaveGoto?.(this, frame, play) ?? false;
  }

  playMaster(frame = null) {
    return this.master?.onSlavePlay?.(this, frame) ?? false;
  }

  stopMaster(frame = null) {
    return this.master?.onSlaveStop?.(this, frame) ?? false;
  }

  _rearmLoopTimerFromFrame(frame) {
    if (this.track.frameStop != null || !this.track.started) return;
    clearTimeout(this.track._loopTimer);
    if (this.track.animDuration <= 1) return;          // plateau d'UNE frame = STATIQUE → pas de bouclage
    const restantMs = Math.max(0, Tsi_.frameToMs(this.track.animDuration - frame));
    this.track._loopTimer = setTimeout(() => this.track.onTimeout(), restantMs);
  }

  // Temps logique de l'esclave = celui du maître − offset (LIVE) → suit sans dérive.
  nowMs() { return this.master ? this.master.nowMs() - this.offsetMs : Date.now(); }

  syncFromMaster(hard = false) {
    if (!this.master) return false;

    const masterStop = this.master.getFrameStop();        // (la durée n'est plus copiée : un esclave garde la sienne — N11-2)
    if (masterStop != null) {
      this.onMasterGotoStop(masterStop);
      return true;
    }

    // Initialisation / passage play : (re)positionner l'esclave sur le maître.
    if (hard || this.track.frameStop != null || this.track.dateStart == null || !this.track.started) {
      this.onMasterGotoPlay(this.master.getFrameNum());
      return true;
    }

    // En régime : l'esclave suit le maître LIVE via nowMs() → AUCUN recalage de
    // dateStart. On RECALE ses pistes sur sa position (resyncPlateau), puis on
    // propage l'intervalle à ses propres sous-esclaves (chaîne).
    this.track.resyncPlateau();
    this.track.clockMaster?.onIntervalSync();
    return true;
  }
}







//########################################################################
//########################################################################
//########################################################################
//########################################################################





class TsiTrackClock extends TsiTrack {
  static CLOCK_NAME = "__clock__";
  //  LA PLAGE D'UN ESCLAVE DE FACE (N11-2, PD 08/10) : 2^37 = 137 438 953 472 frames — le binaire à un seul 1 au-dessus de 10^11,
  //  au-delà de tout film. Sa durée = SPAN + son contenu ; l'export (debuildConfig) soustrait SPAN.
  static FACE_SLAVE_SPAN = 2 ** 37;

  // ── Statiques d'horloge (ex-TsiPlate, dissous — PD 2026-07-09) ─────────────
  /**
   * Mémoire d'horloge (TEMPO) d'une div de plateau — tampon de BUILD seulement :
   * élection de l'horloge (ptClock) + collecte de durée (règle A). Consommé en
   * phase B (TsiBuild.consumeClockTempo). La VÉRITÉ runtime = la piste clock.
   * - body : la mémoire est portée par body.clockTempo
   * - Face : la mémoire est portée par div._tsiFace.clockTempo
   */
  static getDivClockTempo(div, flagCreate = true){
    const holder = div._tsiFace ?? div;
    const clockTempo = holder.clockTempo;
    if (clockTempo || !flagCreate) return clockTempo;
    return holder.clockTempo = { div, ptClock: null, animDuration: 1 };
  }
  /** Tempo du plateau d'une pièce. */
  static getPlateTempo(piece, flagCreate = true){
    return TsiTrackClock.getDivClockTempo(piece.getPlateDiv(), flagCreate);
  }
  /** Accumulateur de la règle A au build : chaque piste pousse sa longueur, le max survit. */
  static setPlateDurationTempo(duration, piece){
    const plateTempo = TsiTrackClock.getPlateTempo(piece);
    if (plateTempo.animDuration >= duration) return;
    plateTempo.animDuration = duration;
  }
  /**
   * Crée la pièce-horloge d'un plateau — DÉCLARATIVE : la pièce naît de sa
   * forme SOURCE (DSL), par la porte officielle (insertAdjacentHTML →
   * connectedCallback → TsiPiece + compile). Une seule écriture de l'horloge,
   * identique à la main, à la volée et au réimport.
   * @param {Element} divParent  div du plateau (connecté)
   * @param {number}  [stopFrame] stop du plateau à cette frame (sinon boucle)
   * @param {number}  [duration]  durée déclarée — transite par le canal !<durée:>
   */
  static createClock(divParent, stopFrame = null, duration = null){
    const dsl = '&synchro'
      + (duration  != null ? ` !<${duration}:>` : '')
      + (stopFrame != null && stopFrame > 0 ? ` ${stopFrame}:stop;` : '');
    divParent.insertAdjacentHTML('beforeend',
      `<tsi-p id="${TsiTrackClock.CLOCK_NAME}" data-tsi="${dsl}"></tsi-p>`);
    return divParent.lastElementChild._tsi.timeline.getTrack("synchro");
  }

  /** UN PLATEAU, UNE HORLOGE — la 2e `la 2e `&clock` rencontréesynchro` rencontrée est FUSIONNÉE (PD) :
   *    durée   = la PLUS LONGUE (jamais de rétrécissement) ;
   *    stops   = la RÉUNION des keys (triée ; même frame = une seule) ;
   *    maître  = celui qui existe — DEUX maîtres = erreur, à résoudre immédiatement.
   *  Réceptacle : l'ARRIVANTE si elle désigne un maître et pas l'en-place, ou si
   *  l'en-place est la Pièce __clock__ (l'échafaudage est absorbé PUIS SUPPRIMÉ
   *  du DOM) ; sinon l'horloge du plateau. L'absorbée est RETIRÉE de sa timeline
   *  (une horloge fantôme mentirait à l'export). */
  static mergeClock(enPlace, arrivante) {
    // « désigne un maître » = l'APPEL SYSTÈME du bloc de config (!<durée, masterVideo(v)>)
    // — c'est lui qui déclenche l'accroche du lien (PD). clockFace : rien de
    // spécial — la mécanique voyage avec la Pièce (déplacer = déplacer sa branche).
    const aMaitre  = c => !!c.src?.length;
    const scaffold = enPlace.piece?.div?.id === TsiTrackClock.CLOCK_NAME;
    if (aMaitre(enPlace) && aMaitre(arrivante))
      TsiError.error(`plateau : conflit de MAÎTRES entre les horloges de #${enPlace.piece?.div?.id ?? '?'} et #${arrivante.piece?.div?.id ?? '?'} — à résoudre immédiatement`);
    const [recept, absorbee] = (scaffold || (aMaitre(arrivante) && !aMaitre(enPlace)))
      ? [arrivante, enPlace] : [enPlace, arrivante];
    recept.animDuration = Math.max(recept.animDuration ?? 1, absorbee.animDuration ?? 1);
    for (const k of absorbee.keys) {                       // réunion des stops
      if (k.numFrame < 0) continue;                        // pseudo-key -1 : propre à chaque piste
      if (recept.keys.some(r => r.numFrame === k.numFrame)) continue;
      const idx = recept.keys.findIndex(r => r.numFrame > k.numFrame);
      if (idx === -1) recept.keys.push(k); else recept.keys.splice(idx, 0, k);
    }
    if (!recept.src?.length && absorbee.src?.length) recept.src = absorbee.src;   // le maître survit
    recept.clockSlave ??= absorbee.clockSlave;
    // FUSION EN PLEIN JEU — sûr PAR CONSTRUCTION, plus seulement de fait :
    // les timers armés (stop key-to-key, boucle, resync) capturent leur piste
    // en closure et tireraient au nom de l'absorbée retirée ; le réceptacle
    // qui jouait a lui aussi des timers périmés (keys/durée fusionnées).
    const enJeu = [recept, absorbee].find(c => c.started && c.frameStop == null);
    const F = enJeu ? TsiTrackClock.getFrameNum(enJeu) : null;
    absorbee.stopClocks?.();                               // les 3 familles annulées
    absorbee.keys.length = 0;                              // plus de keys dans DEUX tableaux
    const tl = absorbee.piece?.timeline;
    if (tl) tl.tracks = tl.tracks.filter(t => t !== absorbee);
    if (scaffold) enPlace.piece.div.remove();              // l'échafaudage devenu inutile
    TsiTrackClock.getPlateTempo(recept.piece).ptClock = recept;
    TsiTrackClock._distributeClock(recept);               // la vérité runtime = piece.ptClock
    if (enJeu) recept.gotoPlayGroup?.(F);                  // reprise : ré-arme tout sur l'état FUSIONNÉ
    return recept;
  }

  /** L'horloge VIVANTE d'un plateau : le tempo pendant le parse (l'échafaudage,
   *  consommé au start), puis la vérité distribuée sur les Pièces (piece.ptClock). */
  static plateClock(piece) {
    const plateDiv = piece.getPlateDiv();
    const tempo = TsiTrackClock.getDivClockTempo(plateDiv, false);
    if (tempo?.ptClock) return tempo.ptClock;
    for (const c of plateDiv.children)
      if (c._tsi?.ptClock) return c._tsi.ptClock;
    return null;
  }

  /** Redistribue l'horloge élue/fusionnée aux Pièces du plateau (le geste de
   *  preparePiece, rejoué après une fusion runtime). */
  static _distributeClock(clock) {
    for (const c of clock.piece.getPlateDiv().children)
      if (c._tsi?.isPiece) c._tsi.ptClock = clock;
  }

  /** MEMBRANE DU PLATEAU — AJOUT d'une Pièce (fin de build + putPiecesInPlate) :
   *  les vérifications d'horloge vivent ICI (PD), pas dans le constructeur. */
  static addPieceToPlate(piece) {
    const clock = piece.timeline?.getTrack?.('synchro');
    if (!(clock instanceof TsiTrackClock)) return;
    const enPlace = TsiTrackClock.plateClock(piece);
    if (!enPlace || enPlace === clock) {
      TsiTrackClock.getPlateTempo(piece).ptClock = clock;    // prise de place (parse : tempo vivant)
      return;
    }
    TsiTrackClock.mergeClock(enPlace, clock);
  }

  /** MEMBRANE — RETRAIT d'une Pièce (à appeler AVANT de détacher sa div) :
   *  si elle portait l'horloge du plateau, re-création immédiate de l'implicite
   *  (durée CONSERVÉE — jamais de rétrécissement) ; le plateau continue. */
  static supprPieceFromPlate(piece) {
    const clock = TsiTrackClock.plateClock(piece);
    if (!clock || clock.piece !== piece) return;
    const plateDiv  = piece.getPlateDiv();
    const duration  = clock.animDuration ?? 1;
    for (const c of plateDiv.children) if (c._tsi) c._tsi.ptClock = null;   // l'orpheline part…
    const tempo0 = TsiTrackClock.getDivClockTempo(plateDiv, false);
    if (tempo0) tempo0.ptClock = null;                     // …du tempo aussi (sinon l'implicite naissant fusionnerait avec elle)
    const neuf = TsiTrackClock.createClock(plateDiv, null, duration);
    TsiTrackClock.getDivClockTempo(plateDiv).ptClock = neuf;
    TsiTrackClock._distributeClock(neuf);
  }

  //  SA PART DE FORME — la commune par super(), puis ce qu'une piste de TEMPS a en
  //  propre. Aucun travail ici : `_applyClockSystemCalls()` en est SORTI (2026-08-13),
  //  c'est l'exécution de la config `!<durée, appel>` et le fabricant l'appelle déjà
  //  (tispiBuild.js:347). Signature alignée sur (prop, piece) : le `new` du builder
  //  est uniforme pour toutes les pistes, le polymorphisme choisit le bon ctor.
  constructor(prop, piece) {
    super(prop, piece);
    this.dateStart  = null;
    this.frameStop = null;
    this.started    = false;
    this._loopTimer = null;   // timer de boucle (clearTimeout pour gotoPlayGroup/gotoStopGroup)
    //  ⚠ `timelineEnd`, `timelineStop`, `timelineStop0` (PD 2026-08-23) — un jeu par PLATEAU, portés
    //  par l'horloge comme frameStop et animDuration. Ils répondent à trois questions
    //  DISTINCTES, calculées au départ du tour (prevoirBouclage()) :
    //    timelineEnd   — la fin de ce tour est-elle déjà traitée ? (premier-arrivé)
    //    timelineStop  — ce tour finit-il sur un stop ? ⇒ le TIMER seul le clôt
    //    timelineStop0 — le retour en 0 est-il figé ?   ⇒ gotoStopGroup(0)
    this.timelineEnd   = true;    // true tant qu'aucune timeline n'est partie
    this.timelineStop  = false;
    this.timelineStop0 = false;
    this._resyncTimer = null; // timer de recalage du plateau (non-esclave) — refonte master/slave
    // Pas de this.ptClock : la piste clock lit son horloge (= elle-même) via sa Pièce,
    // l'init posant piece.ptClock = la clock. Cf. nextKeySync (track.piece.ptClock).
    this.clockMaster = null;   // créé paresseusement quand un esclave s'attache (attachToMaster)
    this.clockSlave  = null;   // créé paresseusement quand &clockMaster/&clockFace pose une requête
    // (Pas d'auto-affectation au tempo ici : l'élection/fusion appartient à la
    //  MEMBRANE du plateau — TsiTrackClock.addPieceToPlate, appelée en fin de
    //  build de la Pièce et par putPiecesInPlate. PD : les vérifications
    //  d'horloge vivent dans l'ajout/retrait de Pièce, pas dans un constructeur.)
  }
  /**
   * ⚠ SANS APPELANT depuis le 2026-08-09 — dernier vestige du chemin TABLE, côté
   * horloge (celui des pistes ordinaires, _buildDescriptor, a été retiré le même
   * jour). Sa seule porte d'entrée était `this.buildTrack(input)` dans le ctor de
   * TsiTrack ; le ctor ne pose plus que l'identité, et aucune horloge n'a jamais
   * de tableau : createClock écrit du DSL (`&synchro !<durée:>`) que le chemin
   * normal tokenise. Le décodage VIVANT du bloc !<durée, appel> est dans
   * TsiPieceBuilder.buildOneTrack (tispiBuild.js — chercher `isClock`) : durée
   * déclarée, _clockSystemCalls, pseudo-key -1, puis _applyClockSystemCalls().
   * Conservée comme référence du format, à la manière de TsiFc.
   *
   * Syntaxe clock : paires strictes [frame, action] — l'action y était NUMÉRIQUE
   * (l'ancien TsiKeyClock.STOP = 1), le parser générique la confondrait avec une
   * frame. (Depuis 2026-08-13 la valeur vivante est le singleton TSI_STOP, testé
   * par identité — la confusion n'existe plus dans le chemin DSL.)
   *   ["synchro"]              → pas de key (horloge simple)
   *   ["synchro", 40, 1]       → stop du plateau à la frame 40
   *   ["synchro", 40, 1, 200]  → idem + borne de durée à 200
   */
  buildTrack(arr) {
    let trackLen = 0;
    for (let i = 1; i < arr.length;) {
      if (arr[i] === -5) {
        // Bloc de CONFIGURATION !<durée?, appel?> : une tête numérique = la
        // DURÉE DÉCLARÉE du plateau (règle A : max avec les pistes, via
        // setPlateDurationTempo qui garde le max) ; le reste = appel système.
        let call = arr[i + 1] ?? [];
        if (typeof call[0] === 'number') {
          trackLen = Math.max(trackLen, call[0]);
          call = call.slice(1);
        }
        if (call.length) {
          this._clockSystemCalls ||= [];
          this._clockSystemCalls.push(call);
        }
        i += 2;
        continue;
      }
      // Frame seule en fin → KEY VIDE classique (PD 2026-07-07 : plus de « borne »
      // spéciale — durée MINIMUM comme toute key, s'édite naturellement).
      if (i + 1 >= arr.length) {
        this.keys.push(new TsiKeyClock(arr[i], undefined));
        trackLen = Math.max(trackLen, arr[i] + 1);   // une key ÉTEND, n'écrase pas la durée déclarée
        break;
      }
      this.keys.push(new TsiKeyClock(arr[i], arr[i + 1]));
      trackLen = Math.max(trackLen, arr[i] + 1);    // KEY (stop) de fin → +1 (son tick) ; ÉTEND, n'écrase pas
      i += 2;
    }
    // LA DURÉE VIT SUR L'HORLOGE : posée ici dès le build (connaissance propre :
    // déclarée + keys) — la règle A (max avec les pistes sœurs, collectée par le
    // tempo) l'affinera à consumeClockTempo. L'export lit donc TOUJOURS la piste.
    this.animDuration = trackLen;
    TsiTrackClock.setPlateDurationTempo(trackLen, this.piece);
    // Pseudo-key à -1 : état neutre, garantit une key courante dans gotoPlay/gotoInfo
    this.keys.unshift(new TsiKeyClock(-1, null));
  }
  // TsiTrackClock — SA config, rien d'autre : la durée du plateau (TOUJOURS émise,
  //  c'est elle qui la fait persister) puis l'appel-maître venu de la provenance.
  debuildConfig(ctx) {
    this.debuildAttrsBlock(ctx);                       // en-tête `!<$$…>` d'abord, comme la mère
    const d = this.animDuration >= TsiTrackClock.FACE_SLAVE_SPAN ? this.animDuration - TsiTrackClock.FACE_SLAVE_SPAN : this.animDuration;   // l'esclave de Face : la vraie longueur du contenu (N11-2)
    ctx.dt += ' !<' + d + ':';
    for (const c of this.src ?? []) ctx.dt += `, ${c[0]}${c.length > 1 ? '(' + c.slice(1).join(',') + ')' : ''}`;   // toute la liste, dans l'ordre
    ctx.dt += '>';
  }
  _applyClockSystemCalls() {
    if (!this._clockSystemCalls) return;
    for (const call of this._clockSystemCalls) {
      const [fcName, ...args] = call || [];
      const fc = Tsi_.fcSystem.clock[fcName];
      if (!fc) TsiError.error("Fonction systeme clock inconnue : " + fcName);
      fc(this, ...args);
    }
    this.src = this._clockSystemCalls;   // PROVENANCE : le chemin vers le maître (!<…>), ré-émis à l'export
    this._clockSystemCalls = null;       // consommé : ne sera jamais ré-exécuté
  }

  // Temps logique « maintenant » de l'horloge : libre → horloge système ; esclave →
  // délégué au maître (− offset) en LIVE. Toutes les estampilles (dateStart,
  // _transitionStart, _intervalStart) et getTimeMs passent par ici → un esclave suit son
  // maître sans dérive logique.
  nowMs() { return this.clockSlave?.master ? this.clockSlave.nowMs() : Date.now(); }

  // ── Recalage périodique du plateau (refonte master/slave) ──────────────────
  // Le DÉCLENCHEUR vit sur l'horloge, PAS sur la piste. Une clock NON-esclave qui
  // joue arme ce timer (gotoPlayGroup()) ; à chaque tic elle recale ses pistes puis,
  // si elle a des esclaves, propage via son service maître. Un esclave n'arme rien :
  // il est recalé par la cascade de son maître (syncFromMaster → resyncPlateau).
  resyncPlateau() {
    this.piece.messageAllTracks((track) => {
      if (track instanceof TsiTrackClock) return 'continue';
      track.resync();
    });
  }
  startResync() { if (!this._resyncTimer) this._armResync(); }
  stopResync()  { clearTimeout(this._resyncTimer); this._resyncTimer = null; }
  _armResync() {
    const delay = Tsi_.synchroInterval + Math.random() * Tsi_.synchroIntervalMargin;
    this._resyncTimer = setTimeout(() => {
      this._resyncTimer = null;
      if (this.frameStop != null) return;          // figé → gotoPlayGroup réarmera au prochain play
      this.resyncPlateau();                        // recale les pistes de CE plateau
      this.clockMaster?.onIntervalSync();          // propage la cascade aux esclaves (si maître)
      this._armResync();
    }, delay);
  }

  //  `prevoirBouclage()` (PD 2026-08-23) — au DÉPART du tour on sait déjà
  //  comment il finira, et comment on y rentrera. Deux questions, deux champs :
  //    timelineStop   — un stop dans les 2 DERNIERS temps ⇒ la fin appartient au
  //                     TIMER seul : le premier-fini coupe jusqu'à une frame trop
  //                     tôt, et couper avant un stop, c'est le RATER.
  //    timelineStop0  — un $stop() au 1er temps ⇒ le retour se fait FIGÉ.
  //  ⚠ Le stop d'HORLOGE en frame 0 n'est PAS cherché ici : gotoPlayGroup() le voit
  //  déjà (« stop DÉCLARÉ à frame ») et bascule seul vers gotoStopGroup() — inutile
  //  de dupliquer (PD).
  //  PESSIMISTE par construction : au doute, true. Un faux positif ne coûte que la
  //  RÉACTIVITÉ (fin traitée par le timer au lieu du premier fini : plus lent, jamais
  //  faux) ; un faux négatif, lui, RATE un stop.
  prevoirBouclage() {
    const fin = this.animDuration;
    //  ⚠ LE SEUIL NE DESCEND JAMAIS SOUS 1 (PD 2026-08-23) : sur un plateau COURT,
    //  `fin - 2` atteint 0 ou moins, et le stop de la frame 0 tomberait dans « les 2
    //  derniers temps ». Or ce stop-là n'est pas un stop de FIN : c'est le point de
    //  DÉPART, franchi au lancement, et rencontré au RETOUR — il relève de
    //  timelineStop0, pas de timelineStop. Le confondre ferait taire les animates
    //  pour rien (fin traitée par le seul timer sur un plateau de 2 frames).
    const seuilFin = Math.max(1, fin - 2);
    let stopFin = this.keys.some(k => k.value === TSI_STOP && k.numFrame >= seuilFin);
    let stop0   = false;
    //  messageAllTracks() balaie le plateau ENTIER — la Pièce de l'horloge ET tous ses
    //  frères (tispiPiece.js : « ce nœud et tous ses frères du même plateau »).
    this.piece.messageAllTracks((track) => {
      if (track.css?.constructor?.trackFormat !== TrackFormat.EVENT) return 'continue';
      for (const k of track.keys) {
        if (!k.value?.contientStop?.()) continue;
        if (k.numFrame === 0)      stop0   = true;
        if (k.numFrame >= seuilFin) stopFin = true;
      }
    });
    this.timelineStop  = stopFin;
    this.timelineStop0 = stop0;
  }

  /**
   * L'horloge déclenche le bouclage de l'animation
   */
  //  LE SIGNAL DU PREMIER-FINI (étape 1 du chantier bouclage, PD 2026-08-23) —
  //  chaque animate de plateau signale SA fin (onfinish, posé par playTrack/makeAnim
  //  quand loop) ; le PREMIER reçu déclenche le re-bouclage, les retardataires sont
  //  COUPÉS (re-seekés à 0, ils ne finissent jamais ce tour : aucun signal périmé).
  //  ⚠ `timelineEnd` (PD 2026-08-23) — un DRAPEAU : false quand la
  //  timeline part (gotoPlayGroup(), et le tour suivant dans onLoopRestart()), true dès
  //  que la première fin est traitée. Les suivantes sortent sur le simple `if`.
  //  POURQUOI : la fin d'une timeline est signalée DEUX FOIS — par le _loopTimer et
  //  par l'onfinish de chaque piste animée. Sans le drapeau, la deuxième effaçait le
  //  stop que la première venait de poser, et le plateau se figeait sur une frame
  //  quelconque (l'étoile réapparaissait « souvent, pas toujours », PD).
  //  ⚠ Il REMPLACE trois gardes DÉDUITES (frameStop, started, et un écart de temps
  //  `nowMs()-dateStart < 1 frame`) : elles devinaient ce que le drapeau DIT.
  //  Règle PD : au doute, pose un flag d'ABORD, simplifie ensuite.
  //  Les deux signaux entrent ICI, jamais dans onLoopRestart() directement.
  onAnimFinished() {
    if (this.timelineStop) return;      // ce tour finit sur un stop : onTimeout s'en charge
    this.finTimeline();
  }

  //  `onTimeout()` — sans la garde ci-dessus : quand un stop est prévu
  //  en fin de tour, c'est lui seul qui traite la fin, parce qu'il mesure la durée EXACTE.
  onTimeout() { this.finTimeline(); }

  finTimeline() {
    if (this.clockSlave?.master && this.clockSlave.mode !== 'repeat') return;   // ESCLAVE `once` : fixe au bout de ma durée, j'attends le goto du maître (N11-2)
    if (this.timelineEnd) return;       // la fin de CE tour est déjà traitée
    if (this.frameStop != null) return; // plateau arrêté : il n'a pas à reboucler
    this.timelineEnd = true;
    this.onLoopRestart();
  }

  onLoopRestart() {
    //  Le setTimeout du tour précédent est annulé d'abord : si l'onfinish a signalé la
    //  fin le premier, ce timer est encore armé — sans ce clear, il tirerait
    //  quelques ms plus tard et REBOUCLERAIT une seconde fois.
    clearTimeout(this._loopTimer);
    this._loopTimer = null;
    this.started   = false;


    //  UN PLATEAU QUI REPART N'EST PLUS ARRÊTÉ (PD 2026-08-21). Sans cette ligne,
    //  `frameStop` gardait la valeur posée par un stop antérieur pendant que la
    //  boucle tournait : l'état MENTAIT, et la garde d'entrée de stopGroup
    //  (`if (this.frameStop != null) return`) refusait tout arrêt ultérieur —
    //  un `&onTime 0:{ $stop(); }` devenait définitivement impuissant, le plateau
    //  bouclant sans fin (mesuré en console : la key suivante tirée 282 fois).
    this.frameStop = null;

    //  ══ LE RATTRAPAGE + LA GARDE (étapes 2 et 4, PD 2026-08-23) ══
    //  AVANT tout retour en 0 : les keys de FIN non visitées (la coupure) tirent
    //  leurs actions immédiates — rôles ÉVÉNEMENTIELS, et les STOPS de la chaîne
    //  d'horloge elle-même. Puis la garde du 21/08 : une action a pu FIGER le
    //  plateau ($stop() inscrit par fonction, stop d'horloge de fin) — le
    //  re-bouclage est alors ABANDONNÉ, l'arrêt est déjà complet (gotoStopGroup()).
    const fin = this.animDuration;
    this.piece.messageAllTracks((track) => {
      if (track instanceof TsiTrackClock) return 'continue';
      if (track.css?.constructor?.trackFormat === TrackFormat.EVENT) track.rattrape(fin);
    });
    for (let i = this.keyIndex + 1; i < this.keys.length; i++) {   // les stops d'horloge manqués
      const k = this.keys[i];
      if (k.numFrame > fin) break;
      if (k.value === TSI_STOP) { this.keyIndex = i; this.gotoStopGroup(k.numFrame); break; }
    }
    if (this.frameStop != null) return;

    //  `timelineStop0` (PD 2026-08-23) — prevoirBouclage() a vu un $stop() au 1er
    //  temps : on rentre en 0 ARRÊTÉ, sans relancer. La relance ci-dessous reste le
    //  chemin normal du bouclage — fondu depuis _lastKeyValue, franchissement de la
    //  key 0, signal onLoop() aux esclaves : gotoPlayGroup() ne fait AUCUN des trois de
    //  la même façon (fromValue null, onGotoPlay() au lieu d'onLoop(), _disparTimer
    //  désarmé), il ne peut donc pas s'y substituer.
    if (this.timelineStop0) { this.gotoStopGroup(0); this.clockMaster?.onLoop(); return; }

    this.piece.messageAllTracks((track) => {
      if (track instanceof TsiTrackClock) return 'continue';
      //  PREMIER-FINI (étape 1) : l'animate est FINI et TIENT (iterations:1, fill) —
      //  plus de wrap autonome. Le fondu d'entrée de key0 joue s'il est DÉCLARÉ
      //  (_armGoto — fromValue = la dernière key : l'animate fini la tient, la
      //  valeur est déterministe SANS course désormais) ; sinon le GESTE UNIQUE :
      //  seek(0) + play — la piste repart, dans la même frame JS que ses sœurs.
      if (o_.singleAnim && track.css instanceof TsiCssAnimated) {
        if (!track._armGoto(0, true, track._lastKeyValue()))
          track._animSeek(0, true);
        return 'continue';
      }
      track.activeKeyAt0();
    });
  
    // Relance le setTimeout pour le prochain bouclage

    this.started    = true;
    this.dateStart  = this.nowMs();   // estampille en temps logique
    //  LE TOUR NEUF PART : on prévoit son bouclage, et le verrou se rouvre — ici,
    //  au DÉPART de la timeline, comme au lancement (gotoPlayGroup()).
    this.prevoirBouclage();
    this.timelineEnd = false;
    //  ⚠ Même garde qu'en gotoPlayGroup() (PD 2026-08-21) : les pistes viennent de
    //  rejouer leur key 0 ci-dessus, l'une d'elles a pu appeler `$stop()`. Ne pas
    //  ré-armer la boucle par-dessus son arrêt.
    if (this.frameStop == null && this.animDuration > 1)  // plateau d'UNE frame = STATIQUE → pas de bouclage
      this._loopTimer = setTimeout(() => { this.onTimeout(); },
        Tsi_.frameToMs(this.animDuration));

    //  Relance la chaîne de keys de la clock elle-même (messageAllTracks() la saute) —
    //  en la FRANCHISSANT (PD 2026-08-23) : re-boucler, c'est RE-ENTRER dans la
    //  frame 0, pas s'y positionner. C'est TsiKeyClock.exec qui décide : key stop →
    //  il arrête le plateau par la voie officielle (sa garde frameStop ≠ F laisse
    //  repartir) — `&clock 0:1` devient le ONE-SHOT ; key ordinaire → il chaîne vers
    //  la suivante. L'ancien `activeKeyAt0()` (→ gotoPlay = POSITIONNEMENT) snapait
    //  la key 0 sans la franchir : le stop de départ n'existait qu'au premier
    //  démarrage, le plateau bouclait sans fin (mesuré navigateur ; une prothèse
    //  scannant les keys en tête de cette fonction a été écrite puis SUPPRIMÉE —
    //  le citoyen TsiKeyClock savait déjà).
    //  (searchKey, pas keys[0] : la table commence par la pseudo-key -1.)
    const i0 = this.searchKey(0);
    this.keys[i0]?.exec(this, i0);
    this.clockMaster?.onLoop();
  }
  gotoPlayGroup(frame) {
    // Plateau d'UNE frame (durée <= 1 : la seule frame est la 0) = STATIQUE → il
    // ne JOUE pas : il se POSE et se FIGE (équivalent d'un stop, unifié avec
    // `&clock 0:1`). Sans quoi l'horloge started « court » sans fin au-delà de sa
    // durée — la frame courante dépassait key0 et setCssCurr (resize) ne rejouait
    // plus rien.
    if (this.animDuration <= 1) { this.gotoStopGroup(frame); return; }

    // MISE EN ACTIVITÉ (plateau inactif → actif) : les transitions par DÉFAUT
    // (-2/-3/-4) ne jouent pas à l'apparition — seul le goto explicite d'une key.
    const appearing = (this.frameStop === -1);

    clearTimeout(this._disparTimer); this._disparTimer = null;   // re-play : DÉSARME un setInactive armé (sans le tirer)

    // 1 — Annuler le timer de boucle en cours
    clearTimeout(this._loopTimer);

    // 1b — Stop DÉCLARÉ à `frame` : honoré à l'ENTRÉE de cette frame (ex. `&clock
    //      0:stop` au démarrage — jamais « franchi » puisque c'est le point de
    //      départ). SAUF si on repart PILE de ce stop (frameStop === frame →
    //      l'utilisateur veut le franchir) : sinon on stoppe au lieu de jouer.
    if (this.frameStop !== frame &&
        this.keys.some(k => k.numFrame === frame && k.value === TSI_STOP)) {
      this.gotoStopGroup(frame);
      return;
    }

    // 2 — Repointer l'horloge sur la frame cible
    //     Sortie de l'état stop : frameStop redevient null, sinon
    //     getTimeMs/getFrameNum resteraient figés sur l'ancien stop.
    this.frameStop = null;
    this.started   = true;
    this.dateStart = this.nowMs() - Tsi_.frameToMs(frame);   // estampille en temps logique
    this.prevoirBouclage();     // la timeline PART : on prévoit comment elle finira
    this.timelineEnd = false;   // …et elle a le droit de finir

    // 2b — Relancer la chaîne de keys de la clock elle-même (messageAllTracks() la saute).
    //      Positionnée PILE sur une key stop → keyNext seul compte : pas de re-stop.
    this.clearTimers();
    this.gotoPlay(frame);

    // 2c — Accumulateurs de LAYOUT (posBar : areaRemainder) : chaque passe de
    //      plateau REJOUE le partage depuis la feuille PLEINE (idempotence). Sans
    //      ce reset, le bouclage re-rognait l'état → le layout glissait à chaque tour.
    this.areaRemainder = null;
    for (const d of this.piece.getPlateDiv().children) if (d._tsi) d._tsi.areaRemainder = null;

    // 3 — Positionner et lancer toutes les pistes du plateau. _activating : flag
    //     transitoire lu par les APPARITIONS DE FACE déclenchées dans ce balayage
    //     synchrone (setCss face → setActivePlate) — le when des transitions.
    this._activating = appearing; this._descents = [];
    this.piece.messageAllTracks((track) => {
      if (track instanceof TsiTrackClock) return 'continue';
      track.clearTimers();
      track.gotoPlay(frame, null, false, appearing);
    });
    this.descend();

    // 4 — Relancer le timer de boucle pour la durée restante. Plateau d'UNE frame
    //     (durée <= 1 : la seule frame est la 0) = STATIQUE → AUCUN bouclage.
    //     ⚠ SAUF si l'étape 3 vient d'ARRÊTER le plateau (PD 2026-08-21) : une key
    //     jouée là-haut peut appeler `$stop()`, qui coupe cette boucle — ré-armer
    //     par-dessus sa décision laissait un plateau à la fois marqué stoppé et
    //     tournant. Après avoir laissé jouer une action, on vérifie qu'elle n'a pas
    //     changé le cours du temps.
    if (this.frameStop == null && this.animDuration > 1) {
      const restantMs = Math.max(0, Tsi_.frameToMs(this.animDuration - frame));
      this._loopTimer = setTimeout(() => this.onTimeout(), restantMs);
    }
    this.clockMaster?.onGotoPlay(frame);
    if (!this.clockSlave?.master) this.startResync();   // clock NON-esclave → recale son plateau périodiquement
  }
 
  /**
   * Saute à la frame N et stoppe toutes les pistes du plateau.
   * Le timer de boucle est annulé sans relance.
   */
  gotoStopGroup(frame) {
    // MISE EN ACTIVITÉ (plateau inactif → actif, ex. stop déclaré à la frame de
    // départ) : pas de transition par défaut à l'apparition — capté AVANT l'écrasement.
    const appearing = (this.frameStop === -1);

    // 1 — Annuler le timer de boucle (stop = pas de relance)
    //     + la chaîne de keys de la clock elle-même
    clearTimeout(this._loopTimer);
    this._loopTimer = null;
    this.clearTimers();
    this.frameStop = frame;

    // 1b — Accumulateurs de LAYOUT (posBar : areaRemainder) : passe idempotente,
    //      repart de la feuille PLEINE (cf. gotoPlayGroup() 2c).
    this.areaRemainder = null;
    for (const d of this.piece.getPlateDiv().children) if (d._tsi) d._tsi.areaRemainder = null;

    // 2 — Positionner et stopper toutes les pistes du plateau (_activating : cf. gotoPlayGroup())
    this._activating = appearing; this._descents = [];
    this.piece.messageAllTracks((track) => {
      if (track instanceof TsiTrackClock) return 'continue';
      track.clearTimers();
      track.gotoStop(frame, appearing);
    });
    this.descend();
    this.stopResync();                  // plus de recalage périodique tant qu'on est figé
    this.clockMaster?.onGotoStop(frame);
  }

  //  LES DESCENTES (PD 04/10, « terminer chaque nœud avant d'entamer les fils ») : après les pistes de TOUTES les Pièces du
  //  plateau, chaque Face choisie par &face s'active — ses propres pistes, puis son plateau. _activating reste levé pendant
  //  les descentes : les fils apparaissent avec le plateau.
  descend() {
    const due = this._descents; this._descents = null;
    for (const [face, prev] of due) face?.setActivePlate?.(prev);
    this._activating = false;
  }

  // ══ DÉSACTIVATION (≠ cacher) : arrêter le MOTEUR (le CSS via les pistes), pas l'horloge ══
  // Coupe les timers PROPRES de l'horloge (synchro). Factorisé, réutilisable.
  stopClocks() {
    clearTimeout(this._loopTimer); this._loopTimer = null;
    this.clearTimers();
    this.stopResync();
  }

  // Change la longueur du plateau (frames) — L'ATOME UNIQUE de modification de
  // durée (règle PD : JAMAIS de rétrécissement automatique — supprFrames ne
  // réduit pas ; raccourcir = CE geste explicite ; les allongements implicites
  // — init, import, key au-delà — passent AUSSI par ici). Undo = restaurer
  // l'ancienne valeur. La durée est un paramètre de TOUS les animates du
  // plateau (offsets calculés sur elle) → re-projection plateau-wide.
  setPlateDuration(newLen) {
    const oldLen = this.animDuration;
    if (newLen === oldLen) return;
    this.animDuration = newLen;
    if (typeof TsiUndo !== 'undefined')
      TsiUndo.record(() => this.setPlateDuration(oldLen));
    this.piece.messageAllTracks(t => {
      t.css._anim?.cancel(); t.css._anim = null;
      t._regoto();
    });
    // Durée changée PENDANT le run → réarmer le timer de boucle sur la
    // nouvelle échéance (sinon un tour de boucle sur l'ancienne durée).
    if (this.started && this.frameStop == null && this._loopTimer) {
      clearTimeout(this._loopTimer);
      if (newLen > 1) {                                // plateau d'UNE frame = STATIQUE → pas de bouclage
        const restantMs = Math.max(0, Tsi_.frameToMs(newLen) - TsiTrackClock.getTimeMs(this));
        this._loopTimer = setTimeout(() => this.onTimeout(), restantMs);
      }
    }
  }

  // Désactivation SÈCHE : teardown synchro + DISPATCH du stop-moteur à chaque piste.
  setInactive() {
    if (this.frameStop === -1) return;                 // idempotent
    this.stopClocks();
    this.started = false; this.frameStop = -1; this.dateStart = null;
    this._descents = null;   // les descentes DUES vers les Faces — une liste pendant un balayage de plateau, null sinon (PD 04/10)
    this.piece.messageAllTracks((track) => {
      if (track instanceof TsiTrackClock) return 'continue';
      track.setInactive?.();                           // chaque piste arrête SON moteur, si défini
    });
  }

  // Entrée désactivation : delay>0 → ARME un setInactive (effet OUT joué pendant) ; sinon sec.
  armInactive(delayMs) {
    if (delayMs <= 0) { this.setInactive(); return; }   // sec
    clearTimeout(this._disparTimer);
    this._disparTimer = setTimeout(                      // ARME un setInactive (l'effet OUT joue PENDANT)
      () => { this._disparTimer = null; this.setInactive(); },
      delayMs
    );
  }

  stopGroup() {
    if (this.frameStop!=null) return;
    let frameNum = TsiTrackClock.getFrameNum(this);

    // Aimantation — chercher la key la plus proche avant et après
    let nearestBefore = -Infinity;
    let nearestAfter  =  Infinity;

    this.piece.messageAllKeys(frameNum, (key, keyIndex, keys, track) => {
      if (track instanceof TsiTrackClock) return 'continue';
      if (key.numFrame >= 0 && key.numFrame > nearestBefore) nearestBefore = key.numFrame;
      const keyNext = keys[keyIndex + 1];
      if (keyNext && keyNext.numFrame < nearestAfter) nearestAfter = keyNext.numFrame;
    });

    const distBefore = frameNum - nearestBefore;
    const distAfter  = nearestAfter - frameNum;
    const mag        = Tsi_.keyOffsetAccepted;

    if      (distBefore <= mag && distBefore <= distAfter) frameNum = nearestBefore;
    else if (distAfter  <= mag)                            frameNum = nearestAfter;

    this.gotoStopGroup(frameNum);
  }

  /**
   * Source de vérité unique pour le temps courant d'une horloge, en ms (temps WAAPI).
   * Toujours utiliser cette fonction — jamais la formule brute directement.
   * Plateau stoppé (frameStop posé) → temps figé sur la frame de stop.
   * @param  {TsiTrackClock|null} clock
   * @returns {number} temps courant en millisecondes
   */
  static getTimeMs(clock) {
    if (clock?.frameStop != null) return Tsi_.frameToMs(clock.frameStop);
    if (clock?.dateStart==null) return 0;
    return clock.nowMs() - clock.dateStart;   // temps logique de l'horloge (libre/esclave/vidéo)
  }

  /**
   * Frame courante d'une horloge — projection de getTimeMs() en temps timeline.
   * @param  {TsiTrackClock|null} clock : ??? TODO - accepter piece track et key
   * @returns {number} frame courante arrondie à l'entier le plus proche
   */
  static getFrameNum(clock) {
    return Math.round(Tsi_.msToFrame(TsiTrackClock.getTimeMs(clock)));
  }

}
// ═════════════════════════════════════════════════════════════
//  TIMELINE
// ═════════════════════════════════════════════════════════════
class TsiTimeline {
  constructor(tracks, piece) {
    this.piece = piece;
    this.tracks = [];
  }
  getTrack(trackName){
      for(const t of this.tracks){
          if(t.prop===trackName) return t;
      }
      return null;
  }
  forTracks(onTrack,params) {
    for (const track of this.tracks) {
      const result = onTrack(track, params);
      if (!result || result === 'continue') continue;
      if (result === 'break') break;
      return result;
    }
  }
  /**
   * Pose d'une piste CONSTRUITE — le point unique anti-doublon du runtime.
   * @param {TsiTrack} track
   * @param {boolean}  replace  true : une homonyme est retirée (animate annulé) et
   *                            RETOURNÉE (l'inverse d'undo) ; false : homonyme → erreur.
   * @returns {TsiTrack|null} la piste remplacée, ou null
   */
  setTrack(track, replace = false) {
    const prev = this.getTrack(track.prop);
    if (prev) {
      if (!replace)
        TsiError.error(`setTrack : piste '&${track.prop}' déjà présente sur '${this.piece?.div?.id ?? '?'}'`);
      prev.css?._anim?.cancel();
      this.tracks.splice(this.tracks.indexOf(prev), 1);
    }
    this.tracks.push(track);
    return prev ?? null;
  }
}









//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiCore.js  (1184 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
//  tispiCore.js — LES GLOBALES ET LE MOTEUR DE RENDU
// ═════════════════════════════════════════════════════════════════════════════
//
//  Tsi_ (configuration, registre des fonctions système) · TrackFormat ·
//  la famille TsiCss* — ce qui POSE la valeur sur le DOM, par opposition à la
//  Piste qui décide QUAND · le namespace o_ · TsiStart, l'entrée de la page ·
//  et, en queue de fichier, les trois fonctions d'horloge de Tsi_.fcSystem.
//
//  CHARGEMENT : 2e des quatre, APRÈS tispiTrack.js — les classes Css portent
//  `static track = TsiTrackFace` / `static key = TsiKeyFace`, évalués À LA
//  DÉFINITION comme un extends : dans l'ordre inverse, ReferenceError. C'est
//  pour rompre ce cycle que les Tsi_.fcSystem.clock.* sont ici et non dans la
//  zone horloge. AVANT tispiTracksCss.js, qui s'enregistre dans o_.css.
//
//  Issu de la découpe de tispi001.js (2026-08-09) — voir aussi tispiTrack.js,
//  tispiPiece.js, tispiTracksCss.js. L'entête de travail ci-dessous lui est
//  antérieure.
// ═════════════════════════════════════════════════════════════════════════════
/*
Mais 5 manques réels dans la mécanique :

1 - Garde de cycle ABSENTE (bloquant) — $a := \&x $a`→insertMacrore-splice$a→ **splice infini / gel**. L'ancienexpandavait le Setexpanding. Il faut un Set de noms en cours d'incrustation, testé dans insertMacro`.

2 - Macro-: (corps de keys) CASSÉE — insertMacro splice le .src brut. Pour &… le & fait partie de la syntaxe piste (OK). Pour :0: red…, le : d'en-tête (que TsiValMacro.init strippait) reste dans le flux → misparse. Donc seuls les track-macros marchent. Il faut strip le : de tête dans insertMacro (garder le &).

3 - Provenance / round-trip export → ✅ FAIT (2026-08-14/15). La pile [nom, target] est copiée sur chaque piste et chaque key à leur naissance (`track.macros` / `key.macros`, tispiBuild.js) ; la restitution la lit et RECOLLE `$nom;` — TsiPiece.debuildTracks (target 1) et TsiTrack.debuildKeys (target 0), le nom écrit UNE fois, les éléments contigus consommés. Éprouvé sur le splice réel (banc_macro_get). L'ancien `_macro`/`macroTag` n'a jamais existé dans le code découpé.

4 - Code mort à retirer — TsiValMacro.init() (l'incrustation réifiée + son routage &/:) n'est plus appelé (insertMacro le remplace) ; et TsiTimeline.expand n'avait plus de TsiVarGet à expanser (la macro est splicée avant le build) → ✅ FAIT le 2026-08-09 : tout le corps du constructeur de TsiTimeline est supprimé (les six appelants passaient null ou [], la garde Array.isArray sortait ou les boucles n'itéraient pas). L'expansion vit désormais dans tispiBuild.js:713 (incrustation TEXTUELLE). Reste à retirer : TsiValMacro.init().

5 - Incohérence track-level vs keys-level (à vérifier) — _buildKeys utilise insertMacro (splice textuel), mais _readTracksInto (tispiParser.js:857 ; sa copie vivante = buildTracks, tispiBuild.js:238) pousse encore un TsiVarGet dans tracks (ancien chemin → expand mort). Un $var en position de piste pure et un $var dans des keys prennent donc deux voies différentes. À unifier (les deux devraient splicer).




  // frameStop 
 /**
 A vérifier :
 - boucle sur la frame 0 : ✓ vérifié (2026-06-11) — onLoopRestart recale dateStart
   et relance toutes les pistes via activeKeyAt0, observé stable sur plusieurs cycles.
   - utilité de 
      - activeKeyAt0()
      - onePiece()
      - class TsiOnMouse extends TsiGroup {
TisPiParser : collectFuncNames cherchait `instanceof TsiFc` → ✅ RÉPARÉ le 2026-08-11 (parcours du modèle réifié) ; TsiFc SUPPRIMÉE le même jour.
 */
/*
   - animDuration
     - création : 1 par plateau de Pièces, à la rencontre de la ère Piece 
     <TsiPiece>.contructor()
        if (!div.parentNode._ts i)
            div.parentNode._ts i = { ptClock: null, animDuration: 0 };
   
/**
TODO


Inventaire de ce qui manque, par priorité :

---

**Critique — bloque le démarrage**

1. **`TsiArrayFree` est abstraite** mais `TsiListenerHub` fait `new TsiArrayFree(8)` → throw. Conflit à résoudre.

2. **`TsiListenerHub`** — renommage non finalisé : appelle encore `_free.register()` et `_free.destroy()` (anciens noms → `_alloc()` / `_free()`).

3. **`TsiEditorTool.destroy()`** — `suppr()` sans argument :
```javascript
destroy() { TsiEditor.registry.suppr(); }  // ← manque this
```

4. **`TsiEditorSelection`** — singleton central référencé partout (`select()`, `showElastic()`, `.hubs`) — non implémenté.

5. **`TsiDragDiv`** — conçu en conversation, pas encore écrit dans un fichier.

---

**Important — pour le fonctionnement éditeur**

6. **`TsiEditorMultiSelection`** — singleton agrégation multi-sélection — non implémenté.

7. **`TsiGroupIndex`** — service de navigation des groupes — non implémenté.

8. **Connexion pièce → éditeur** — quand une pièce entre en mode édition, sa piste `onMouse` doit recevoir `piece.editor.mouseHandler` et `TsiDragDiv` doit être branché.

---

**Peut être différé**

9. `TsiGroupElastique` — poignées de redimensionnement.
10. Bridge dynamique `TsiEditorSelection._bridge`.
11. Implémentation complète multi-sélection.

---

**Ordre suggéré :** 1 → 2 → 3 → 5 → 4 → 8
*/


// ═════════════════════════════════════════════════════════════════════════════
//  LE MODÈLE DE PAGE SAUVEGARDÉE — structure FIXE, ZONES variables
// ═════════════════════════════════════════════════════════════════════════════
//  Motif WvAnim : `<!--[nom]-->` … `<!--[/nom]-->`. La sauvegarde REMPLIT une
//  zone par un `replace` (TsiDecompiler._fillZone) et ne touche à rien d'autre.
//  Les zones sont VIDES ici : il n'y a jamais rien à effacer.
//
//  Ajouter une zone = 4 gestes : une ligne ici, un `_fillZone` dans
//  saveDocument, une source (constante, calcul, ou récolte du debuild), et — si
//  la source est une récolte — un citoyen de valeur qui dépose (cf.
//  TsiValUserJs). Voir docs/DOM_INCRUSTATIONS.md.
//
//  ORDRE DE CHARGEMENT, et il compte : le noyau, puis le projet (o_ existe, les
//  registres peuvent se remplir), puis les scripts de l'auteur qui en dépendent.
const TSI_HTML_HEADER =
`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title><!--[tispi_name]--><!--[/tispi_name]--></title>
    <!--[tispi_player]--><!--[/tispi_player]-->
    <!--[tispi_project_js]--><!--[/tispi_project_js]-->
    <!--[tispi_js_user]--><!--[/tispi_js_user]-->
  </head>
  <body>
`;

//  LA LISTE CANONIQUE DU NOYAU — une seule vérité. Le découpage de tispi001.js
//  avait laissé 56 pages cassées, chacune portant sa liste en dur ; désormais
//  la liste vit ICI, et chaque re-sauvegarde met la page à jour.
const TSI_PLAYER = [
  'tispiTools', 'tispiParser', 'tispiUndo', 'tispiTrack', 'tispiCore', 'tispiPiece',
  'tispiTracksCss', 'tispiVar', 'tispiBuild', 'tispiGroup', 'tispiLayout',
  'tispiFuncs', 'tispiLang.fr', 'tispiEditor',
].map(f => `\n    <script src="${f}.js"></script>`).join('')
  + '\n    <script>o_.singleAnim = true;</script>\n    ';


// ═════════════════════════════════════════════════════════════
//  Tsi_ — CONFIGURATION GLOBALE ET REGISTRE SYSTÈME
// ═════════════════════════════════════════════════════════════
class Tsi_{
  /*
    static idPieceUnic = 0;
    */
    static fcSystem = { clock: {} };
    static spatialUnity = "px";
    /** décalage autour d'une key qui force le piste à ce caler sur les valeurs de la key */
    static keyOffsetAccepted     = 10;
    static frameDuration         = 100/6; //1000/5, //1000 / 60,
    static synchroInterval       = 1000; //1000/5, //1000 / 60,
    static synchroIntervalMargin = 1000; //1000/5, //1000 / 60,

    // ─── Conversions temps timeline (frames) <-> temps WAAPI (ms) ───
    // Source unique : toujours passer par ces deux fonctions, jamais
    // par la formule brute * / o_.FRAME_MS.
    static frameToMs(frame) { return frame * Tsi_.frameDuration; }
    static msToFrame(ms)    { return ms / Tsi_.frameDuration; }
}
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________

//       #########        #######        #######       ################
//      ####    ####     ##     ##      ##     ##      ################ 
//      ####             ###            ###            ################ 
//      ####               ####           ####         ################ 
//      ####                  ###            ###       ################ 
//      ####    ####     ##     ##      ##     ##      ################ 
//       #########        #######        #######       ################


// ═════════════════════════════════════════════════════════════
//  CSS CLASSES  (une instance par piste, créée dans buildTrack)
// ═════════════════════════════════════════════════════════════

// Format de piste — hook DÉCLARATIF (pas d'instanceof) qui détermine la
// réconciliation après mutation de la table (cf. insertKey). Déclaré en
// `static trackFormat` sur chaque classe css concernée.
//   STATE   : état courant (face, onClick) → re-appliquer au bon frame.
//   EVENT   : événement (onTime)           → ré-armer le futur, jamais re-tirer un passé.
//   ANIMATE : 1 courbe WAAPI globale        → reconstruire l'animate.
const TrackFormat = { STATE: 1, EVENT: 2, ANIMATE: 3 };

class TsiCssBase {
  static defaultValue = undefined;
  static track        = null;
  static key          = null;
  // Valeur courante lisible au DOM (getCss) ? true = props simples (pos, size,
  // opacity, color…). false = la lecture DOM est non fiable (ex. rotat : transform
  // mixé + perte >360°) → la valeur courante vient du calcul manuel (valueAt).
  static domReadable  = true;
  // VALEUR-VARIABLE : forme CSS d'une key `$nom` — défaut = la property entière
  // (couleurs, valeurs à unité). Les tuples numériques (pos, size) surchargent
  // en composantes calc(var(…-i) * 1px) — les composantes sont émises par
  // Tsi_.setVarProperty à la déclaration/affectation.
  static varValue(q)  { return `var(${q})`; }
  // VARIABLE DE KEY : la classe de vars selon la NATURE de la piste — défaut
  // (ANIMATE) = transport CSS ; TsiCssFace (STATE) surcharge en TsiVarsKeyFace.
  static keyVarsFor(key, track) { return new TsiVars((n, v, e) => Tsi_.setVarProperty(e.piece, n, v)); }
  constructor(pieceMaster) {
    this.pieceMaster  = pieceMaster;
    // setCss/transit : définis soit comme méthodes de prototype (sous-classe),
    // soit liés en instance par le constructeur de la sous-classe (anciennes classes o_).
  }
  // ⚠ CE QUE CETTE CLASSE NE SAIT PAS (relevé 2026-08-11, à corriger au fil de l'eau) :
  //   • sa PISTE. D'où `setCss(value, track)` — l'appelant lui tend ce qu'elle devrait
  //     porter ; tispiTracksCss.js:50 l'a même renommée `_track`, ne s'en servant pas.
  //     Elle est pourtant à portée à la construction (`this.track.css = new CssClass(piece)`,
  //     tispiBuild.js:347). `new CssClass(piece, track)` la lui donnerait partout.
  //   • de QUELLE NATURE est son porteur. `pieceMaster` vaut une Pièce OU une Face :
  //     le builder d'une Face se passe la Face (`new TsiFaceBuilder(face)`, tispiBuild.js
  //     1066), qui devient le `piece` de `new CssClass.track(prop, piece)` et de
  //     `new CssClass(piece)`. La Face est donc bien LÀ — sous un nom qui ment. Le discriminant existe :
  //     `isPiece`, posé sur TsiPiece SEULEMENT (tispiPiece.js:119) ; est une Face ce qui
  //     n'est pas marqué. Il n'y a donc rien à ajouter, seulement à interroger.
  //   • sa KEY et sa FRAME — connues au seul moment du tir, donc à joindre par l'appelant.
  //   Conséquence : `toKeyframe(value)` (tispiCore 554, 585 · tispiTracksCss 58, 145, 248)
  //   et `setup(value)` (594) n'ont NI piste NI key — ils ne peuvent pas construire un
  //   contexte. C'est pourquoi seuls les blocs `{ … }` en reçoivent un pour l'instant
  //   (décision PD 2026-08-11) : les valeurs Tispi continuent de recevoir une Pièce.

  /**
   * Interpolation scalaire d'UNE composante : a→b à la fraction pc∈[0,1].
   * Numérique (rotat, opacity, x/y de pos…) → interpolé. Non numérique
   * (couleur, faceId…) → snap (départ tant que pc<1, arrivée à 1).
   */
  static _lerp1(a, b, pc) {
    const na = Number(a), nb = Number(b);
    return (Number.isFinite(na) && Number.isFinite(nb)) ? na + pc * (nb - na)
                                                        : (pc < 1 ? a : b);
  }

  /**
   * Valeur interpolée entre deux valeurs de key, à la fraction eased pc.
   * Défaut = scalaire (couvre rotat, opacity, et tout futur scalaire ; snap
   * pour les non-numériques). Surchargé par composante dans pos/size.
   * Appelé par TsiTrack.valueAt — échantillonnage hors-playhead.
   */
  lerp(a, b, pc) { return TsiCssBase._lerp1(a, b, pc); }

  // ══ LES MESSAGES DE L'HORLOGE ════════════════════════════════════════════
  //  TsiTrackClock les diffuse à toutes les pistes de son plateau ; la PISTE les
  //  relaie ici sans décider. Un rôle qui n'a rien de particulier à faire garde
  //  le geste par défaut ; un rôle qui doit REFUSER le message écrit un corps
  //  vide (cf. TsiCssButton). C'est ce qui remplace TsiTrackButton/TsiTrackFace,
  //  supprimées le 2026-08-20 : le comportement appartient au rôle, pas à une
  //  classe de piste. Voir le TODO en tête de TsiTrack (tispiTrack.js).

  //  Redémarrage temporel : la piste se replace sur sa key 0.
  activeKeyAt0(track) { track.gotoPlay(0); }

  //  Désactivation : couper l'accompagnement (setTimeout key-à-key) + pauser le
  //  MOTEUR = l'animate CSS (s'il existe). Le CSS est le moteur, pas l'horloge.
  setInactive(track) { track.clearTimers(); this._anim?.pause(); }

  //  ══ LE FORMAT DÉCIDE — trackFormat, enfin LU ═══════════════════════════
  //  Un goto POSITIONNE : il pose la valeur de la key courante, même franchie il
  //  y a longtemps (un état se ré-applique). Les rôles ÉVÉNEMENTIELS refusent —
  //  une action ne se re-tire pas (cf. TsiCssOnTime, TrackFormat.EVENT).
  //  Consulté par TsiTrack.gotoPlay et TsiTrack.gotoStop, aux DEUX seuls points
  //  où le snap se décide. C'est ce qui remplace TsiTrackOnTime.gotoPlay/gotoStop,
  //  supprimées le 2026-08-20 : elles recopiaient le squelette pour éviter ce snap.
  snapAuGoto(track, s, frame) { return true; }
}











//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________

/**
 * Base commune pour les pistes animées via la Web Animations API.
 * Les sous-classes ne définissent que :
 *   - getTarget()        → l'élément DOM ciblé
 *   - toKeyframe(value)  → { propCss: valeurCss, ... } pour anim/style
 */
class TsiCssAnimated extends TsiCssBase {
  static trackFormat = TrackFormat.ANIMATE;   // 1 courbe WAAPI globale → rebuild à la mutation
  constructor(pieceMaster) {
    super(pieceMaster);
    this._anim    = null;   // Animation WAAPI en cours
    this._pending = null;   // {duration, ease, delay} armé par transit()
  }

  getTarget()        { return this.pieceMaster.div; }
  toKeyframe(value)  { return {}; }

  // Pose la valeur — instantané si pas de transition en attente
  setCss(value, track) {
    if (value?.constructor?.isTsiValue) value = value.get(this.pieceMaster);
    const target = this.getTarget();
    if (!target) { this._pending = null; return; }
    const to = this.toKeyframe(value);

    if (this._pending?.duration > 0) {
      const from = {};
      for (const prop in to) from[prop] = getComputedStyle(target)[prop];
      this._anim?.cancel();
      this._anim = target.animate(
        [from, to],
        { duration: this._pending.duration, easing: this._pending.ease.getCss(),
          delay: this._pending.delay, fill: 'forwards' }
      );
    } else {
      this._anim?.cancel();
      this._anim = null;
      Object.assign(target.style, to);
    }
    this._pending = null;
  }

  // Arme (durée>0) ou coupe (0) la prochaine transition
  transit(duration, ease = TSI_LINEAR, delay = 0) {
    this._pending = duration ? { duration, ease, delay } : null;
  }

  // Resynchro horloge : décale l'animation en cours de deltaMs
  // (positif = la piste est en retard → avancer l'animation).
  nudge(deltaMs) {
    if (this._anim?.currentTime == null) return;
    this._anim.currentTime = Math.max(0, this._anim.currentTime + deltaMs);
  }

  /**
   * P2/P3 — Crée l'animate UNIQUE de toute la piste (remplace les N animates
   * par-intervalle). loop=true → iterations:Infinity (la WAAPI boucle seule,
   * onLoopRestart ne re-crée pas) ; loop=false → joue une fois et tient.
   * @param {TsiKey[]} keys
   * @param {number}   animFrames  durée du plateau (frames)
   * @param {boolean}  loop
   */
  playTrack(keys, animFrames, loop = true, defaultTr = null, defaultEffect = null) {
    //  (re)démarrage du main — l'overlay éventuel a été lâché par la piste (TsiTrackClutch.drop, dans _animSeek) : étape C, 27/09
    const target = this.getTarget();

    // ── RÉUTILISATION ────────────────────────────────────────────────────────
    // L'animate est construit UNE FOIS (au 1ᵉʳ play : cas CONSTRUCTION ci-dessous)
    // puis RE-JOUÉ à chaque activation — plus de cancel + re-create. Contrat : toute
    // MUTATION de la piste invalide _anim (cf. insertKey) → rebuild au prochain play.
    if (this._anim) {
      if (target && this._anim.effect) this._anim.effect.target = target;  // poser la cible (bâti à cible nulle possible)
      this._anim.currentTime = 0;              // rejouer l'entrée depuis le début (= comportement historique)
      this._anim.play();
      return;
    }

    // ── CONSTRUCTION (1ᵉʳ play, ou après invalidation) ───────────────────────
    if (!target) return;                       // pas encore de cible → rien à bâtir
    const kf = TsiCssAnimated.buildKeyframes(keys, animFrames, v => this.toKeyframe(v), defaultTr, defaultEffect);
    if (!kf) return;
    const durMs = Tsi_.frameToMs(animFrames);
    if (durMs <= 0) { Object.assign(target.style, kf[0]); return; }   // statique : poser la valeur, pas d'anim
    //  PREMIER-FINI (étape 1 du chantier bouclage, PD 2026-08-23) : plus JAMAIS
    //  Infinity — l'animate FINIT et TIENT sa dernière valeur (fill). Le wrap
    //  autonome du compositeur, en course avec le timer de boucle, déchirait la
    //  scène en deux populations (les animées déjà rebouclées, le timer-driven
    //  encore en fin). Un plateau qui boucle (loop) SIGNALE sa fin au chef —
    //  le PREMIER reçu déclenche le re-bouclage (coupure > écran figé, PD).
    //  LE DISCRIMINANT (PD 2026-08-23, « avant ça fonctionnait ») : la course
    //  wrap/timer n'existe QUE sur un plateau D'HORLOGE — le premier-fini est pour
    //  lui. Un plateau SANS hub (l'apparition de FACE, autonome) garde sa boucle
    //  WAAPI d'antan : caché ou montré il reste VIVANT, chaque réapparition le
    //  trouve en mouvement — iterations:1 uniforme l'avait figé (import mesuré).
    const hub = this.pieceMaster.ptClock;
    this._anim = target.animate(kf,
      { duration: durMs, fill: 'forwards', iterations: (loop && !hub) ? Infinity : 1 });
    if (loop && hub) this._anim.onfinish = () => { if (this._anim?.playState === 'finished') hub.onAnimFinished?.(); };   // un signal PÉRIMÉ (animate déjà relancé par le premier fini) se tait (N11-1)
    // L'ENTRÉE n'est PLUS jouée ici : la piste orchestre le relais (_armEntrance).
  }

  /**
   * MISE-EN-PLACE (phase A) — construit l'animate IN de TOUTE la piste mais
   * NE LE JOUE PAS : Animation WAAPI en `pause`, currentTime=0, INACTIVE.
   * `new KeyframeEffect`/`new Animation` (au lieu de target.animate) autorise
   * une cible `null` tant qu'aucune Face n'est active → aucune application, donc
   * pas de flash frame-0. L'activation (phase B / setActive) pose la cible si
   * besoin, puis seek+play. Pendant unique pour playTrack (qui, lui, joue).
   * @param {TsiKey[]} keys
   * @param {number}   animFrames  durée du plateau (frames)
   * @param {boolean}  loop
   * @returns {Animation|null}
   */
  buildTrackAnimation(keys, animFrames, loop = true, defaultTr = null, defaultEffect = null) {
    this._anim?.cancel();
    this._anim = null;
    const keyframes = TsiCssAnimated.buildKeyframes(keys, animFrames, v => this.toKeyframe(v), defaultTr, defaultEffect);
    if (!keyframes) return null;
    const duration = Tsi_.frameToMs(animFrames);
    if (duration <= 0) return null;                            // statique : rien à animer
    const effect = new KeyframeEffect(
      this.getTarget() ?? null,                               // null tant qu'aucune Face active
      keyframes, { duration, fill: 'forwards',
                   iterations: (loop && !this.pieceMaster.ptClock) ? Infinity : 1 });   // le DISCRIMINANT — cf. playTrack
    this._anim = new Animation(effect, document.timeline);
    if (loop && this.pieceMaster.ptClock) this._anim.onfinish = () => this.pieceMaster.ptClock.onAnimFinished?.();
    this._anim.currentTime = 0;
    this._anim.pause();                                       // construit, positionné, INACTIF
    return this._anim;
  }

  /**
   * ENTRÉE (override) — crée et JOUE l'animate d'entrée : overlay défaut → key0,
   * SANS fill, INDÉPENDANT de l'horloge (joue jusqu'au bout même si stop).
   * Ne suspend PAS le main : c'est la piste (_armEntrance) qui orchestre le
   * relais (sortie/réintroduction du main). Renvoie l'animate (override) ou null.
   * key0 reste à l'offset 0 du main → au retour, le re-calage horloge est exact.
   */
  makeEntranceAnim(pseudo, key0) {
    const target = this.getTarget();
    const t = pseudo && pseudo.interpolation;
    if (!t || t === TsiTransition.NONE || !key0 || !target) return null;
    const durMs = (t.duration != null) ? Tsi_.frameToMs(t.duration) : Tsi_.frameToMs(1);
    return target.animate(
      [this.toKeyframe(pseudo.value), this.toKeyframe(key0.value)],
      { duration: durMs, easing: t.ease.getCss(), delay: Tsi_.frameToMs(t.delay ?? 0) });  // pas de fill
  }

  /** GOTO (override) — comme makeEntranceAnim mais départ = valeur COURANTE
   *  (fromValue, lue par getCss au moment du saut) → key.value, via key.effect
   *  ou l'effet RÉSOLU par la cascade (tr, passé par _armGoto). */
  makeGotoAnim(fromValue, key, tr = null) {
    const target = this.getTarget();
    const t = tr ?? (key && key.effect);
    if (!t || t === TsiTransition.NONE || fromValue == null || !target) return null;
    const durMs = (t.duration != null) ? Tsi_.frameToMs(t.duration) : Tsi_.frameToMs(1);
    return target.animate(
      [this.toKeyframe(new TsiValConst(fromValue)), this.toKeyframe(key.value)],
      { duration: durMs, easing: t.ease.getCss(), delay: Tsi_.frameToMs(t.delay ?? 0) });  // pas de fill
  }

  /**
   * P1 — Keyframes WAAPI pour TOUTE la piste (un seul animate). PUR : pas de
   * `this`, pas de DOM. Departure-based → l'easing d'une keyframe gouverne le
   * segment VERS la suivante (exactement le modèle des keys).
   *
   * @param {TsiKey[]} keys       keys de la piste (keys[0] = pseudo-key -1 = défaut)
   * @param {number}   animFrames durée du plateau (frames), base des offsets
   * @param {function} toKf       value → { propCss: valeurCss }
   * @returns {Object[]|null}     keyframes WAAPI (offsets 0→1), ou null si rien
   *
   * key0 (frame 0) est TOUJOURS à l'offset 0 (sinon frame↔offset↔currentTime
   * faussé → sync déraillée). L'ENTRÉE (apparition progressive de la 1ère valeur)
   * n'est PAS ici : overlay séparé `_playEntrance` (défaut → key0 par-dessus).
   * Cas durée/délai explicites : keyframes intermédiaires (P4) — une key peut
   * alors produire 2 keyframes.
   *
   * EFFET DE BORD : tague chaque key avec `key.kfIndex` = index de SA keyframe
   * principale (valeur à sa frame) dans le tableau retourné. Lien key → animate
   * (ex. éditeur : `anim.effect.getKeyframes()[key.kfIndex]`). Recalculé à chaque
   * build. Les keyframes intermédiaires (P4) ne sont pas taguées (dérivées).
   */
  static buildKeyframes(keys, animFrames, toKf, defaultTr = null, defaultEffect = null) {
    const pseudo = (keys[0] && keys[0].numFrame === -1) ? keys[0] : null;
    const reals  = pseudo ? keys.slice(1) : keys;
    if (reals.length === 0) return pseudo ? [{ ...toKf(pseudo.value) }] : null;
    if (animFrames <= 0)    return [{ ...toKf(reals[0].value) }];   // statique : pas d'anim

    const off = f => Math.max(0, Math.min(f / animFrames, 1));
    const kf  = (v, o, e) => e ? { ...toKf(v), offset: o, easing: e } : { ...toKf(v), offset: o };
    const frames = [];

    // key0 (frame 0) DOIT être à l'offset 0 : sinon la correspondance
    // frame↔offset↔currentTime est faussée et la sync déraille. L'ENTRÉE n'est
    // donc PAS dans ces keyframes — c'est un overlay séparé (playTrack/_playEntrance).

    // Segments ki → ki+1, avec durée/délai EXPLICITES (P4) :
    //   [f0, f0+délai]        tient ki.value
    //   [f0+délai, +durée]    transitionne ki.value → ki+1.value (ease)
    //   [+durée, f1]          tient ki+1.value
    for (let i = 0; i < reals.length; i++) {
      const ki = reals[i];
      const f0 = ki.numFrame;                      // PAS de décalage : key0 → offset 0
      frames.push(kf(ki.value, off(f0)));          // valeur de ki à sa frame
      ki.kfIndex = frames.length - 1;              // index de la keyframe principale de la key
      const cur = frames[frames.length - 1];

      if (i === reals.length - 1) break;           // dernière key : pas de segment
      const f1 = reals[i + 1].numFrame;
      const L  = f1 - f0;
      // Cascade des défauts : l'interpolation de la key, sinon le défaut résolu par l'appelant
      // (piste -2 → élément -3 → app -4) ; `<>` (NONE) = FIXED : ki tient, puis saute (PD 30/09).
      const t0 = ki.interpolation ?? defaultTr;
      //  E-3 — LA FENÊTRE D'ARRIVÉE : sans interpolation, l'EFFET de ki+1 (le sien, sinon le défaut) FINIT sur ki+1
      //  et commence à max(f0 + 1, f1 − durée) ; avant, ki TIENT. Avec une interpolation, elle seule joue en attendant
      //  les deux activités séparées (TODO N9). Le délai de l'effet n'est pas lu au jeu (TODO N9) ; `when` 1 = sauts seulement.
      const e0 = t0 ? null : (reals[i + 1].effect ?? defaultEffect);
      const e  = (e0 && e0 !== TsiTransition.NONE && e0.duration != null && e0.when !== 1) ? e0 : null;
      if (e) {
        const start = Math.max(f0 + 1, f1 - e.duration);
        cur.easing = 'linear';                         // le palier : ki.value tient
        if (start < f1) frames.push(kf(ki.value, off(start), e.ease.getCss()));
        continue;                                      // la cible est posée par l'itération suivante, à off(f1)
      }
      const t  = (t0 === TsiTransition.NONE) ? null : t0;
      const E  = (t0 === TsiTransition.NONE) ? TSI_FIXED.getCss() : ((t && t.ease) ? t.ease.getCss() : 'linear');
      let  dl  = (t && t.delay)            ? t.delay    : 0;
      let  D   = (t && t.duration != null) ? t.duration : L;
      dl = Math.max(0, Math.min(dl, L));
      D  = Math.max(0, Math.min(D, L - dl));

      if (dl > 0) {                                // délai : tient ki.value, puis transite
        cur.easing = 'linear';
        frames.push(kf(ki.value, off(f0 + dl), E));
      } else {
        cur.easing = E;
      }
      if (dl + D < L)                              // transition finie avant ki+1 → tient ki+1.value
        frames.push(kf(reals[i + 1].value, off(f0 + dl + D), 'linear'));
      // sinon : la cible est posée par l'itération suivante à off(f1)
    }

    if (frames[0].offset > 0) {                                              // garantir offset 0
      frames.unshift({ ...frames[0], offset: 0 });
      for (const k of reals) if (k.kfIndex != null) k.kfIndex++;             // l'unshift décale les index
    }
    const last = frames[frames.length - 1];
    if (last.offset < 1) { const { easing, ...hold } = last; frames.push({ ...hold, offset: 1 }); }
    return frames;
  }
}

class TsiCssFace extends TsiCssBase {
  static trackFormat = TrackFormat.STATE;   // swap de face = état courant (re-appliqué au bon frame)

  //  Le moteur d'une piste face n'est PAS un animate — c'est la CASCADE. Désactiver
  //  = désactiver le sous-groupe que cette face affiche (→ re-balaie ses pistes).
  //  ⚠ Ne coupe volontairement PAS les timers : le geste par défaut de TsiCssBase
  //  est REMPLACÉ, pas complété (comportement repris à l'identique de l'ancienne
  //  TsiTrackFace.setInactive, supprimée le 2026-08-20).
  setInactive(track) {
    const sub = track.piece.faceCurr?._tsiFace;
    if (sub instanceof TsiGroup) sub.onePiece()?.ptClock?.setInactive();
  }

  static keyVarsFor(key, track) { return new TsiVarsKeyFace(key, track); }   // état : pas de CSS, reprise par _regoto
  /** PROCESS de swap de face enregistrés par nom (39l) : { fade: sti__fadeFace, … } */
  static processes = {};
  static o_ = {
    setCss: {
      def: function(faceId, track) {
        if (faceId?.constructor?.isTsiValue) faceId = faceId.get(this.pieceMaster);
        // Effet armé par TsiKeyFace.exec (consommé même si la face ne change pas)
        const fx = this._fx; this._fx = null;

        const piece        = this.pieceMaster;
        const facePrevious = piece.getFaceCurr();
        // "" (key vide du DSL) traité comme null → extinction de face
        const faceNew      = (faceId != null && faceId !== "") ? piece.div.querySelector(':scope > #' + faceId) : null;

        const changed = faceNew !== facePrevious;
        // ensureFaceTrack pré-pose faceCurr (pour résoudre l'horloge !<face> AVANT
        // que le plateau ne joue) SANS afficher la face. Au 1er setCss on a donc
        // faceNew === facePrevious alors que la face est encore display:none : il
        // faut la révéler malgré tout — mais sans masquer/onHide de « précédente ».
        //  RÉ-ACTIVATION du plateau (PD 2026-08-23, « avant ça fonctionnait ») : la
        //  face COURANTE ré-apparaît — needsShow — même déjà affichée. Sans quoi une
        //  face enfouie (canon importé, sous-plateau re-montré) restait FIGÉE sur sa
        //  dernière frame : changed faux → retour anticipé → jamais d'onShow, jamais
        //  le rembobinage de playTrack (ct=0 + play). _activating = le drapeau posé
        //  par goto*Group pendant le balayage synchrone d'activation.
        const appearing  = piece.ptClock?._activating === true;
        const needsShow = !changed && faceNew && (faceNew.style.display === 'none' || appearing);
        if (!changed && !needsShow) return;

        // prev = la face réellement REMPLACÉE (null si on ne fait que révéler la
        // face déjà sélectionnée) → faceReapply/onShow agissent comme un 1er show.
        const prev = changed ? facePrevious : null;

        piece.faceCurr  = faceNew;
        piece.isVisible = (faceNew != null);
        if (faceNew) {
          const frameNum = track.keys[track.keyIndex].numFrame;
          // Plateau stoppé (gotoStopGroup en cours) → ne PAS relancer gotoPlay,
          // sinon les pistes repartent ; poser la valeur figée via gotoStop.
          const stopped  = piece.ptClock?.frameStop != null;

          for (const t of piece.timeline.tracks)
            t.css?.faceReapply?.(frameNum, prev, t);                   // pré-init CSS (face encore cachée)

          //  UN GOTO INTERROMPT L'EFFET D'APPARITION EN COURS, puis fait l'opération d'atterrissage (PD 05/10, P-3) — comme toute
          //  piste par son débrayage : le process est l'OVERRIDE de la piste face. Il lit l'écran AVANT que l'ancien soit lâché.
          if (fx) {
            const handle = fx.run(prev, faceNew, fx.durationMs, fx.ease.getCss(), track.clutch);   // le process : lit, débraye, joue
            track.clutch.seize(handle, { returnOn: 'dismiss' });                                  // (pas de principal à suspendre)
            handle.onfinish = () => track.clutch.forget(handle);
          } else {
            track.clutch.drop();                                      // sans effet : l'effet en cours est interrompu…
            faceNew.style.display = 'block';                          // …et la face se pose
          }

          //  Balayage : armer les transitions — EN LECTURE SEULEMENT (le vrai
          //  réarmement : keyNext, cascade, timers/animate alignés — skipSnap car
          //  faceReapply a fait la continuité). FIGÉ : RIEN (PD 2026-08-23) — le
          //  repointage a tout fait, chaque piste a son moteur depuis que size a le
          //  sien (mono-keyframe) ; l'ancien gotoStop(frameNum) était identité pour
          //  toutes, et son dernier office — jouer un fondu d'arrivée déclaré sur
          //  une key décorative pile à la frame du swap — est ABANDONNÉ : le canal
          //  de process du swap est TsiCssFace.processes, pas les showEffect.
          if (!stopped) {
            for (const t of piece.timeline.tracks)
              if (t.css?.faceReapply)
                t.gotoPlay(frameNum, null, true);                     // skipSnap=true
          }
          //  FIGÉ : le repointage suffit à toute piste QUI A SON MOTEUR — mais au
          //  PREMIER affichage d'une CLASSIQUE, les pistes ciblées-face balayées
          //  AVANT &face ont avorté sur cible nulle (faceCurr n'existait pas) :
          //  leur moteur NAÎT ici, sur la face qui vient d'apparaître. Mesuré
          //  23/08 : la suppression aveugle de cette branche rendait #hote
          //  invisible (size/bgColor sans animate, face 0×0). Le goto ne re-sert
          //  QUE les sans-moteur — identité conservée pour les autres.
          else {
            //  ⚠ ACCOLADES OBLIGATOIRES : sans elles, ce else s'attachait au if
            //  INTÉRIEUR de la boucle du haut (dangling else) — figé, il n'était
            //  JAMAIS atteint, et #hote restait invisible (chasse du 23/08).
            for (const t of piece.timeline.tracks)
              if (t.css?.faceReapply && !t.css._anim)
                t.gotoStop(frameNum);
          }
        }
        // Masquage immédiat — sauf si un effet (fx) ou des pistes de disparition
        // (onHide → playOut) prennent la main. prev=null (révélation) → no-op.
        if (prev && !(faceNew && fx) && !prev._tsiFace?.timelineOut)
          prev.style.display = 'none';

        // Plateaux-de-face : le temps local suit l'apparition
        prev?._tsiFace?.onHide?.();
        // Désactivation de la branche SORTANTE (le contenu du groupe). La transition de
        // swap (fx, ms) PRIME sur le durOut de la face (Pièce > face). Le CSS joue la
        // sortie PENDANT le délai ; setInactive n'est ARMÉ que pour la fin.
        if (prev?._tsiFace instanceof TsiGroup) {
          const delayMs = fx ? fx.durationMs : Tsi_.frameToMs(prev._tsiFace.durOut ?? 0);
          prev._tsiFace.onePiece()?.ptClock?.armInactive(delayMs);
        }
        //  LA DESCENTE : due au balayage du plateau (après les pistes de toutes ses Pièces) ; immédiate hors balayage (swap par un goto).
        const hub = piece.ptClock;
        if (hub?._descents) hub._descents.push([faceNew?._tsiFace, prev]);
        else faceNew?._tsiFace?.setActivePlate?.(prev);
      }
    },
    getCss:{
        def : function(track){
            return this.pieceMaster.getFaceCurr();
        }
    },
    setTransition: {
      def: null,
    }
  };
  static defaultValue = null;
  static track        = TsiTrack;
  static key          = TsiKeyFace;
  constructor(pieceMaster) {
    super(pieceMaster);
    this.setCss = TsiCssFace.o_.setCss.def.bind(this);
    this.transit = null;
    this._fx     = null;   // effet de swap armé pour le prochain setCss
  }
  /** Arme l'effet du prochain swap de face (consommé par setCss). */
  armEffect(run, durationMs, ease = TSI_LINEAR) {
    this._fx = { run, durationMs, ease };
  }
  /** L'EFFET D'ARRIVÉE d'une key face (P-2, PD 05/10) : la cascade et le when sont ceux de toute piste (track.arrivalEffect) ;
   *  ici l'effet est un PROCESS nommé (`fade`…) armé pour le swap qui suit, pas un overlay de valeur. Durée : celle de l'effet. */
  armArrival(track, numFrame, appearing = false) {
    const r  = track.arrivalEffect(numFrame, appearing);
    const fx = r?.t.process ? TsiCssFace.processes[r.t.process] : null;
    if (fx) this.armEffect(fx, Tsi_.frameToMs(r.t.duration ?? 1), r.t.ease);
  }
  /** Un SAUT sur une key face (gotoPlay/gotoStop) arme l'effet d'arrivée, comme la lecture — puis le snap (setCss) le consomme. */
  snapAuGoto(track, s, frame, appearing = false) { this.armArrival(track, frame, appearing); return true; }
}

// ── Piste face INTERNE : un nœud fusionné (tsi-pf/tsi-pg) EST sa propre face.
//    Pas de swap/display (déjà affichée) : force juste l'activation de sa branche. ──
//  (TsiTrackFaceInner SUPPRIMÉE le 2026-08-20 — coquille VIDE sous TsiTrackFace.
//   Son comportement suit par le RÔLE : TsiCssFaceInner hérite de TsiCssFace,
//   donc de son setInactive.)

class TsiCssFaceInner extends TsiCssFace {
  static track = TsiTrack;                   // key/defaultValue hérités de TsiCssFace
  constructor(pieceMaster) {
    super(pieceMaster);                               // bind du def hérité…
    this.setCss = () => {                             // …REMPLACÉ : activer le sous-plateau — dû au balayage, immédiat hors balayage
      const hub = this.pieceMaster.ptClock;
      if (hub?._descents) hub._descents.push([this.pieceMaster.face, null]);
      else this.pieceMaster.face?.setActivePlate?.(null);
    };
  }
}


class TsiCssPos extends TsiCssAnimated {
  static defaultValue = [0, 0];
  static track        = TsiTrack;
  static key          = TsiKeyPos;
  static editId       = "editPos";
  static arity        = 2;            // x, y
  static varValue(q)  { return [`calc(var(${q}-0) * 1px)`, `calc(var(${q}-1) * 1px)`]; }

  toKeyframe(value) {
    if (value?.constructor?.isTsiValue) value = value.get(this.pieceMaster);
    return {
      left: Number.isFinite(value[0]) ? value[0] + 'px' : value[0],
      top:  Number.isFinite(value[1]) ? value[1] + 'px' : value[1]
    };
  }

  // Lit la position interpolée courante
  getCss() {
    const s = getComputedStyle(this.getTarget());
    return [parseFloat(s.left), parseFloat(s.top)];
  }

  // Interpolation par composante (x, y) — tuple
  lerp(a, b, pc) {
    return [ TsiCssBase._lerp1(a[0], b[0], pc),
             TsiCssBase._lerp1(a[1], b[1], pc) ];
  }
}

class TsiCssFTarget extends TsiCssAnimated {
  static cssProp = null;
  static jsProp  = null;
  constructor(pieceMaster) {
    super(pieceMaster);
    this._value = undefined;   // dernière valeur posée (pour faceReapply)
  }
  getTarget() { return this.pieceMaster.getFaceCurr(); }

  toKeyframe(value) {
    this._value = value;          // l'OBJET (cohérent avec key.value)
    if (value?.constructor?.isTsiValue) value = value.get(this.pieceMaster);
    return { [this.constructor.jsProp]: value };
  }

  // Lit la valeur interpolée courante
  getCss() {
    const face = this.getTarget();
    if (!face) return null;
    return getComputedStyle(face)[this.constructor.jsProp];
  }

  faceReapply(frameNum, prevFace, track) {
    const face   = this.pieceMaster.getFaceCurr();
    const jsProp = this.constructor.jsProp;
    if (!face || !jsProp) return;

    if (this._anim) {
      // L'animation en cours existe déjà : on la repointe simplement sur la nouvelle face.
      this._anim.effect.target = face;
    } else if (prevFace) {
      face.style[jsProp] = window.getComputedStyle(prevFace)[jsProp];
    } else if (this._value !== undefined) {
      face.style[jsProp] = this._value;
    }

    // Le balayage de TsiCssFace.setCss (gotoPlay/gotoStop) armera la suite.
  }
}
class TsiCssBgColor extends TsiCssFTarget {
  static cssProp      = 'background-color';
  static jsProp       = 'backgroundColor';
  static defaultValue = 'transparent';
  static track        = TsiTrack;
  static key          = TsiKeyBgColor;
}

// PISTE GÉNÉRIQUE : toute prop CSS non modélisée (o_.css[nom] absent) devient une
// classe TsiCssFTarget dont jsProp = le nom (camelCase). Valeur = STRING brute,
// appliquée telle quelle (toKeyframe → style[nom]), interpolée par WAAPI. Cible la
// FACE (apparence), comme bgColor/border/color. Créée à la volée au 1er build et
// CACHÉE dans o_.css[nom] → tous les accès o_.css[prop] la retrouvent ensuite.
Tsi_.makeGenericCss = function (nom) {
  const KeyC   = class extends TsiKeyCss { constructor(f, v) { super(f, v, nom); } };
  const TrackC = class extends TsiTrack {};
  return o_.css[nom] = class extends TsiCssFTarget {
    static jsProp       = nom;
    static cssProp      = nom.replace(/[A-Z]/g, m => '-' + m.toLowerCase());   // camel → kebab
    static defaultValue = '';       // pseudo-key neutre (prop non posée au départ)
    static track        = TrackC;
    static key          = KeyC;
    static arity        = null;     // valeur brute → pas d'arité
    /**
     * tispiCore.js:773	DÉCLARÉ — static isPureCss = true sur la classe css que fabrique Tsi_.makeGenericCss() (l.763)
     * tispiBuild.js:327	POSÉ — {@link TsiNodeBuilder.buildOneTrack()} 
     *                           dans le ctx-valeur de la piste, par TsiNodeBuilder.buildOneTrack()
     * tispiVar.js:499	LU — {@link TsiVal.buildValueSimple()}
     *                         if (ctx.isPureCss) inst = new TsiValPureCss(piece, ctx)
     */
    static isPureCss    = true;     
                                    // PASSE-PLAT : la valeur reste du CSS BRUT (lue jusqu'au ';',
                                    // virgules/espaces gardés) — même une fois la classe ENREGISTRÉE
                                    // dans o_.css (sinon getConstraint la prend pour une prop MODÉLISÉE
                                    // et la lecture bascule en bareword qui casse sur la virgule).
  };
};


class TsiCssClock extends TsiCssBase {
  // Pas de defaultValue : TsiTrackClock.buildTrack pose lui-même sa pseudo-key -1.
  static defaultValue = undefined;
  static track        = TsiTrackClock;
  static key          = TsiKeyClock;
  constructor(pieceMaster) { super(pieceMaster); }
}

// ═════════════════════════════════════════════════════════════
//  NAMESPACE o_
// ═════════════════════════════════════════════════════════════
// 
//






//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________

//         ########  
//        ####  #### 
//       ####    ####
//       ####    ####
//       ####    ####
//        ####  ####    ##########
//         ########     ##########
// 
// 



/**
 * Effet "fade" — fondu enchaîné entre deux faces (WAAPI).
 * Gère lui-même l'affichage : divNew visible immédiatement (opacité 0→1),
 * divPrevious masquée à la fin du fondu. Pas de fill sur divNew : à la fin,
 * l'animation disparaît et la face retrouve son opacité normale.
 * divPrevious peut être null (première apparition → fondu entrant seul).
 */
//  Un PROCESS de swap rend un HANDLE (cancel + onfinish) : la piste le débraye comme un overlay (P-3). Il lit l'écran AVANT
//  que le débrayage lâche l'effet en cours : un fondu interrompu repart de l'opacité où il était, au prorata du chemin restant.
function sti__fadeFace(divPrevious, divNew, durationMs, ease = 'linear', clutch = null) {
  const opacity = div => { const c = getComputedStyle(div); return c.display === 'none' ? 0 : +c.opacity; };
  const fromNew = opacity(divNew), fromPrev = divPrevious ? opacity(divPrevious) : 0;
  clutch?.drop();                                                      // l'effet en cours de la piste est interrompu
  divNew.style.display = 'block';
  const anims = [divNew.animate([{ opacity: fromNew }, { opacity: 1 }], { duration: durationMs * (1 - fromNew), easing: ease })];
  if (divPrevious && divPrevious !== divNew) {
    const out = divPrevious.animate([{ opacity: fromPrev }, { opacity: 0 }], { duration: durationMs * fromPrev, easing: ease, fill: 'forwards' });
    out.onfinish = () => { divPrevious.style.display = 'none'; out.cancel(); };
    anims.push(out);
  }
  const handle = { cancel() { for (const a of anims) a.cancel(); }, onfinish: null };
  Promise.all(anims.map(a => a.finished)).then(() => handle.onfinish?.(), () => {});   // annulé → rien
  return handle;
}
TsiCssFace.processes.fade = sti__fadeFace;


const o_ = {
  css: {
    synchro: TsiCssClock,
    clock:   TsiCssClock,     // alias LEGACY — normalisé en 'synchro' au build (renommage PD 29/08)
    face:    TsiCssFace,
    faceInner: TsiCssFaceInner,
    bgColor: TsiCssBgColor,
    
    pos:     TsiCssPos

  },
  functions: {},   // registre des fonctions/actions (classes-singleton) : système (ici) + projet
  funcProject: {},
  modules: {},     // registre des DÉCLARATIONS de module. ⚠ La machinerie qui le LISAIT est
                   //   suspendue depuis le 2026-08-09 (_module_suspendu/) : le registre survit —
                   //   il est déclaré ici, pas là-bas — mais plus personne ne le consulte.
  FRAME_MS : Tsi_.frameDuration, //1000/5, //1000 / 60,
  transit  : null,
  options  : { warningStop: false },   // mode strict des variables : warning → error (throw) si true
  events : new TsiEvents(),   // ÉVÉNEMENTS GLOBAUX — même classe que node.events, autre portée.
                       //   Y vivent ceux qui n'appartiennent à aucun nœud en particulier : le DRAG
                       //   (dragStart/drag/dragEnd), qu'un observateur quelconque veut suivre sans
                       //   connaître la Pièce saisie — le ctx du sender la lui dit.
  debugLinks : false,  // TRACE des liens périmés du registre (TsiComposPt.get) — muet par défaut :
                       //   un lien qui meurt est un événement NORMAL du cycle de vie, pas un incident.
                       //   Tispi ne balayant jamais les liens, chaque lecture nettoie le sien (onStale).
  effect        : null, // l'EFFET d'apparition par défaut de l'appli (niveau -4) — posé par o_.start (étape E-2)
  interpolation : null, // l'INTERPOLATION par défaut de l'appli (niveau -4) — posée par o_.start
  singleAnim : true,    // ⚰ ENTERRÉ (PD 2026-07-06) : le chemin non-singleAnim (N animates/transitions
                        //   CSS par intervalle) est CONDAMNÉ — défaut true = inatteignable partout.
                        //   Étape 2 à venir : excision du code mort (execTransition, setIntervalExec,
                        //   getTransition, waitTransition, TsiTransition.setTransition, transit()…).

  // ═════════════════════════════════════════════════════════════
  //  UTIL
  // ═════════════════════════════════════════════════════════════
  div: () => document.currentScript.parentElement,

  /**
   * Lance l'animation de tous les plateaux.
   *
   * @param {Array} [a]  — [-4, <transition>]  ou absent
   *
   *  Définit la transition par défaut de toute l'application (niveau -4).
   *  Utilisée en dernier recours si aucune transition n'est définie
   *  au niveau key (-1), track (-2) ou piece (-3).
   *
   *  <transition> — le payload, TRANSMIS NU. Sa forme dit sa nature (étape E-2, 30/09) :
   *    [300]                        → EFFET : durée 300 frames, ease linear
   *    [300, "easein"]              → EFFET : durée 300 frames, ease easein
   *    [300, "easein", "fade", 10]  → EFFET : durée, ease, effet, délai
   *    "easein"                     → INTERPOLATION : durée = intervalle key→key suivante, ease easein
   *    ""                           → TsiTransition.NONE (défaut EXPLICITE « aucune »)
   *
   *  Exemples :
   *    o_.start()                        → pas de transition par défaut (null)
   *    o_.start([300, "easeout"])        → transition progressive 300 frames
   *    o_.start("easein")                → durée = intervalle, ease easein
   */
  start(a, frameDuration, macroLimit, keepJs, root) {   // root : la racine à construire — sinon le parent de la balise script (étape R, 26/09)
    // Vitesse → la SOURCE UNIQUE (Tsi_.frameToMs/msToFrame, l.131-132). L'ancienne
    // cible o_.FRAME_MS n'a PLUS AUCUN lecteur (demi-renommage : les lecteurs ont
    // migré vers Tsi_.frameDuration, l'écriture était restée ici — vitesse ignorée).
    if (frameDuration) Tsi_.frameDuration = frameDuration;
    if (macroLimit != null) TsiTokenizer.MAX_SPLICES = macroLimit;   // plafond d'incrustations (garde anti-cycle du splice)
    if (keepJs) o_.options.keepJs = true;              // conserve TsiJs.scriptJs dans TOUTE la page — $$keepJs/$$supprJs de la Pièce PRIMENT (chantier JS_Script)

    //  La transition par défaut de l'appli : un tuple avec durée = l'effet ; sinon l'interpolation ; '' = NONE explicite ;
    //  rien = aucune. Pas de chevron à lire ici : `start` lit son propre argument (étape E-2).
    if (a === '')                              o_.interpolation = TsiTransition.NONE;
    else if (Array.isArray(a) && a[0] != null) o_.effect        = new TsiEffect(a);
    else if (a != null)                        o_.interpolation = new TsiInterpolation(a);
    
    TsiStart.start(root);

  }
  
  
  
};
// ═════════════════════════════════════════════════════════════
//  MISE-EN-PLACE (phase A) — construction de l'animation, INACTIVE
// ═════════════════════════════════════════════════════════════
//
//  Balaie l'arbre et CONSTRUIT tout (horloges, animates IN) sans rien activer :
//  aucune Face affichée, aucun timer, plateaux figés à frame -1 (frameStop=-1).
//  L'horloge vit dans la Pièce (get-or-create via le contexte) ; chaque Face est
//  une frontière d'horloge indépendante (pile dans le CONTEXTE, plus dans le DOM).
//  Fonctions ISOLÉES → réutilisables par les outils d'édition (addElement…).
//  L'activation (apparition + play) est la phase B (setActive), séparée.
//
//  ⚠ INERTE tant que le walk ne descend pas dans les Faces : aujourd'hui
//  TsiFace.messagePlate ne déclenche pas onEnterFace/onExitFace (→ câblage B).
// class TsiBuild (préparation du start, phase A) → DÉPLACÉE dans tispiBuild.js
// (LE fichier du build : construction directe + phase A). Chargement de
// tispiBuild.js OBLIGATOIRE dans chaque page, après les quatre fichiers du
// moteur (tispiTrack, tispiCore, tispiPiece, tispiTracksCss).
//  MODULES SUR SITE (PD 07/10) — une <template data-tsi-define="nom"> contient la PIÈCE ENTIÈRE (déclarations, pistes,
//  feuille @scope, cargaison à trous <slot name="…">). Elle est inerte pour le DOM comme pour Tispi. Le nom est un REGISTRE
//  (unique). Un nœud de réduction <tsi-module id="…" use="nom" data-tsi="paramètres"> est REMPLACÉ par une copie de la
//  Pièce : elle reçoit son id, ses classes, ses enfants dans les trous (attribut slot="…", un trou non rempli disparaît) et
//  un data-tsi = « paramètres de l'instance + corps du template » — les paramètres se lisent AVANT le corps (resolveVar,
//  var(--x) : l'arbre fait le reste). La Pièce n'existe qu'ici : elle se connecte avec son data-tsi complet, au start, hors
//  du parcours, avant la phase A — le moment que le branchement du 09/08 avait réservé. Pas de balise enregistrée pour
//  tsi-module : connectedCallback tire avant les enfants, et avant un template écrit plus bas. Réentrant, garde de cycle.
//  Paramètre-VALEUR = variable ; paramètre-STRUCTURE = trou (note du 29/08). Né en page (demo_structure_3D_1pc_tsi_module).
class TsiModules {
  static DEPTH_MAX = 20;
  /** Les définitions du document : nom → <template>. Un nom défini deux fois est une erreur, jamais un masquage. */
  static registry() {
    const defs = new Map();
    for (const t of document.querySelectorAll('template[data-tsi-define]')) {
      const nom = t.dataset.tsiDefine;
      if (defs.has(nom)) TsiError.error(`module « ${nom} » : défini deux fois`);
      defs.set(nom, t);
    }
    return defs;
  }
  /** Les trous de la copie reçoivent les enfants de l'instance qui les nomment (slot="…") ; un trou vide disparaît. */
  static fill(copy, inst) {
    for (const slot of copy.querySelectorAll('slot'))
      slot.replaceWith(...[...inst.children].filter(c => c.getAttribute('slot') === slot.name));
  }
  static expand(root, defs = TsiModules.registry(), depth = 0) {
    if (depth > TsiModules.DEPTH_MAX) TsiError.error(`modules : imbrication trop profonde (cycle ?)`);
    for (const inst of root.querySelectorAll('tsi-module')) {
      const nom = inst.getAttribute('use'), tpl = defs.get(nom);
      if (!tpl) { TsiError.warning(`module « ${nom} » : aucune définition <template data-tsi-define> — #${inst.id || '?'} laissé tel quel`); continue; }
      const copy = tpl.content.firstElementChild.cloneNode(true);          // la racine du template = la Pièce
      TsiModules.fill(copy, inst);
      if (inst.id) copy.id = inst.id;
      for (const c of inst.classList) copy.classList.add(c);
      copy.dataset.tsi = (inst.dataset.tsi ?? '') + '\n' + (copy.dataset.tsi ?? '');
      inst.replaceWith(copy);                                              // la connexion construit la Pièce, data-tsi complet
      TsiModules.expand(copy, defs, depth + 1);                            // les instances arrivées avec la copie
    }
  }
}

class TsiStart {
  static firstFace(rootDiv) {
    for (const childDiv of rootDiv.children) {
      if (!childDiv._tsi) continue;
      if (childDiv._tsi === childDiv._tsiFace) return childDiv;  // canon de page : un groupe racine sous body = l'espace de la page
      const face = childDiv._tsiFace;
      if (face) return face.div;                                 // Pièce racine (format historique)
    }
    return null;
  } 
  static start(root) {
    //  La racine : celle qu'on passe (React, un module : pas de balise inline, currentScript est nul),
    //  sinon le parent de la balise <script> qui appelle start — toutes les pages existantes. (étape R)
    const rootDiv = root ?? document.currentScript.parentElement;
    if(rootDiv._tsi==null){  
      rootDiv._tsi = new TsiPiece(rootDiv);  // Pièce racine implicite (body)
      rootDiv._tsi.faceCurr = TsiStart.firstFace(rootDiv);  // face racine implicite (body)
    }
    //  MODULES SUR SITE (PD 07/10) : l'expansion, hors du parcours, avant la phase A — la place que le branchement
    //  neutralisé du 09/08 avait réservée (« c'est le MOMENT de l'expansion »). Les Pièces copiées se connectent ici.
    TsiModules.expand(rootDiv);

    TsiStart._checkDuplicateIds();                    // ids uniques sur Pièces/faces (warning)
    TsiVar.checkReads();                              // chaque $nom lu a sa déclaration (PD 08/10) — l'arbre est complet

    // ══ A — MISE-EN-PLACE : tout construit, en pause, INACTIF (frameStop = -1) ══
    //     Aucune Face affichée, aucun timer : plateaux/Pièces STOPPÉS à -1.
    const ctx = TsiBuild.createStartContext();
    TsiBuild.prepareRoot(rootDiv, ctx);         // horloge du plateau racine (body)
    for (const childDiv of rootDiv.children) {
      if (!childDiv._tsi) continue;
      if (childDiv._tsi === childDiv._tsiFace) {
        // CANON DE PAGE : un GROUPE racine sous body = l'ESPACE de la page
        // (body = la Pièce implicite ; le groupe porte le nom de l'appli).
        // messagePlate suffit : prepareFace pousse son horloge (couture),
        // ses Pièces sont visitées, faceQuit dépile.
        childDiv._tsi.messagePlate(
          TsiBuild.preparePiece, TsiBuild.pieceQuit,
          TsiBuild.prepareFace,  TsiBuild.faceQuit,
          ctx
        );
        continue;
      }
      childDiv._tsi.messageTree(                      // Pièce racine (format historique)
        TsiBuild.preparePiece, TsiBuild.pieceQuit,
        TsiBuild.prepareFace,  TsiBuild.faceQuit,
        ctx
      );
    }
    // Liaison master/slave faite LOCALEMENT (clockMaster(name) en preparePiece,
    // clockFace à onShow) — plus de batch linkAllClocks.

    // ══ B — ACTIVATION : franchir frame 0 et jouer. gotoPlayGroup réutilise les
    //     animates bâtis par A et arme le timer de recalage de l'horloge. Les
    //     esclaves sont pilotés par leur maître (onGotoPlay + cascade d'intervalle)
    //     — plus de batch d'activation master/slave. ══
    //     Groupes racines (canon) : AFFICHÉS ici (une face racine n'a pas de
    //     porteuse pour la montrer) + leur plateau autonome démarré.
    for (const childDiv of rootDiv.children) {
      if (childDiv._tsi && childDiv._tsi === childDiv._tsiFace) {
        childDiv.style.display = '';                  // sort du display:none de construction
        childDiv._tsi.onePiece?.()?.ptClock?.gotoPlayGroup(0);
      }
    }
    ctx.clockCurr.gotoPlayGroup(0);                   // plateau racine (body)
    TsiStart.watchVisibility();                       // onglet caché : pause ; retour : reprise à la frame quittée
  }

  //  ONGLET CACHÉ (PD 04/10 — « c'est ce que je fais dans mon ancien moteur ») : caché, le navigateur bride les
  //  minuteurs et ne calcule plus les animations ; au retour chaque acteur aurait vécu un temps différent.
  //  UNE politique : PAUSE à la disparition, REPRISE au retour, à la frame quittée — par les gestes du plateau
  //  (gotoStopGroup / gotoPlayGroup : animates, minuteurs, cascade vers les esclaves). Les horloges ESCLAVES
  //  ne sont pas touchées : elles suivent leur maître, et la vidéo a sa propre politique d'onglet.
  static _pausedByTab = null;                          // [horloge, frame] des plateaux mis en pause par l'onglet
  static _watching    = false;                         // start() peut être appelé plusieurs fois : UN écouteur
  static watchVisibility() {
    if (TsiStart._watching) return;
    TsiStart._watching = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const seen = new Set();
        TsiStart._pausedByTab = [];
        for (const node of TsiPiece.piecesPt.values()) {
          const clock = node.ptClock;
          if (!clock || seen.has(clock)) continue;
          if (clock.frameStop != null || clock.clockSlave?.master) continue;   // figée ou inactive · esclave
          seen.add(clock);
          const frame = TsiTrackClock.getFrameNum(clock);
          TsiStart._pausedByTab.push([clock, frame]);
          clock.gotoStopGroup(frame);
        }
      } else {
        for (const [clock, frame] of TsiStart._pausedByTab ?? []) clock.gotoPlayGroup(frame);
        TsiStart._pausedByTab = null;
      }
    });
  }

  // ══ Vérifications init/DOM — avertissements NON bloquants (console.warn) ══

  //  LE FORMAT D'UN NOM TISPI — un identifiant, au sens des langages : lettres,
  //  chiffres et `_`, ne commençant pas par un chiffre. Un SEUL endroit le dit ;
  //  ids (ici) et noms de projet (TsiDecompiler.saveDocument) s'y réfèrent.
  static ID_FORMAT = /^[A-Za-z_]\w*$/;

  /** Ids dupliqués DANS UNE MÊME FRATRIE (même parent). Les ids identiques dans des
   *  plateaux/groupes DIFFÉRENTS sont LÉGITIMES (bonne pratique, portée locale) : la
   *  résolution Tispi est scopée — &face → `:scope > #id` (enfant direct), getNamedAncestor
   *  → ancêtre le plus proche, registre → par slot. On n'alerte donc QUE sur une vraie
   *  collision : deux frères de même id. */
  static _checkDuplicateIds() {
    const byParent = new Map();                        // parentElement → Map(id → count)
    for (const el of document.querySelectorAll('[id]')) {
      if (!el._tsi && !el._tsiFace) continue;          // élément Tispi uniquement
      //  FORME DE L'ID — même parcours, même moment : un id Tispi est un NOM DE
      //  VARIABLE. La contrainte existait DE FAIT (un tiret ou un espace est
      //  intokenisable dans `&face 0:repos;`, `_up(menu)`, un path) ; elle est
      //  désormais DITE. Elle vaut aussi pour la sauvegarde : l'id du groupe
      //  racine nomme les fichiers et l'espace de fonctions `o_.func_<nom>`.
      if (!TsiStart.ID_FORMAT.test(el.id)) TsiLang.warn('idFormat', { id: el.id });
      let ids = byParent.get(el.parentElement);
      if (!ids) byParent.set(el.parentElement, ids = new Map());
      ids.set(el.id, (ids.get(el.id) || 0) + 1);
    }
    for (const ids of byParent.values())
      for (const [id, n] of ids)
        if (n > 1)
          TsiLang.warn('idDuplicate', { id, n });
  }

  /** &face pointant vers un id absent de la Pièce → face éteinte silencieusement. */
  static _checkFaceIds(piece) {
    const ft = piece.timeline?.getTrack('face');
    if (!ft) return;
    for (const key of ft.keys) {
      const id = key.value;
      if (typeof id !== 'string' || id === '') continue;            // vide / pseudo-key → ignorer
      const sel = (window.CSS && CSS.escape) ? CSS.escape(id) : id;
      if (!piece.div.querySelector(':scope > #' + sel))
        TsiLang.warn('faceMissing', { id, piece: piece.div.id || '(sans id)', frame: key.numFrame });
    }
  }

}
//____________________________________________________________________________

//
//
//     ###########   ############         #####          #########     ####    ####
//        ####       ####     ####       ########       ####    ####   ####   ####          ####
//        ####       ####     ####      ####  ####      ####           ####  ####           ####
//        ####       ############       ####  ####      ####           ########     ###################
//        ####       ####   ####       ############     ####           ####  ####           ####
//        ####       ####    ####      ####    ####     ####    ####   ####   ####          ####
//        ####       ####     ####     ####    ####      #########     ####    ####
//
//

Tsi_.fcSystem.clock.clockMaster = (track, clockParentName, offsetFrames = 0) => {
  (track.clockSlave ||= new TsiClockSlaveService(track)).requestMasterFromPieceParent(clockParentName, offsetFrames);
};

Tsi_.fcSystem.clock.face = (track, offsetFrames = 0) => {
  (track.clockSlave ||= new TsiClockSlaveService(track)).requestMasterFromFace(offsetFrames);
};
Tsi_.fcSystem.clock.clockFace = Tsi_.fcSystem.clock.face;   // alias rétro-compat : !<clockFace()>

//  LE MODE DE FIN DE TIMELINE d'un esclave (N11-2, PD 08/10) : `once` (défaut) — au bout de SA durée il reste FIXE et attend
//  le goto de son maître ; `repeat` — il reboucle seul, la frame du maître se lit modulo sa durée. `!<clockMaster(world), repeat>`.
Tsi_.fcSystem.clock.once   = track => { (track.clockSlave ||= new TsiClockSlaveService(track)).mode = 'once'; };
Tsi_.fcSystem.clock.repeat = track => { (track.clockSlave ||= new TsiClockSlaveService(track)).mode = 'repeat'; };


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiPiece.js  (1493 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
//  tispiPiece.js — LES COMPOSANTS
// ═════════════════════════════════════════════════════════════════════════════
//
//  TsiNode · TsiPiece · TsiFace · TsiFaceDom, puis, en queue de
//  fichier, tsiTag et les définitions de custom elements — tsi-p, tsi-f,
//  tsi-pf, tsi-pg, tsi-g.
//
//  La Pièce est AGNOSTIQUE : conteneur, identité, horloge. Toute
//  spécialisation se compose en Pistes, jamais en sous-classe. Et la Face
//  n'est qu'une cargaison opaque que la Pièce trimbale : l'intelligence est
//  toujours côté Pièce (règle n°1).
//
//  CHARGEMENT : 3e des quatre. Les tsiTag de la fin référencent les *Builder
//  de tispiBuild.js, chargé APRÈS — sans conséquence : le corps de la flèche
//  ne s'exécute qu'à l'upgrade de l'élément, pas à la définition.
//
//  Issu de la découpe de tispi001.js (2026-08-09) — voir aussi tispiTrack.js,
//  tispiCore.js, tispiTracksCss.js.
// ═════════════════════════════════════════════════════════════════════════════
class TsiNode{
  constructor(div) {
    this.div = div;
    this.idUnic  = null;
    this.idUnic    = TsiPiece.piecesPt.put(this);   // put pose un TsiIdUnic {uid, pos, table} + inscrit la Pièce au registre
    this.isVisible = false;
    //  ÉVÉNEMENTS diffusés par ce nœud (TsiEvents, tispiTools.js). Posée ICI et
    //  non au premier abonnement : la table est un ORGANE du nœud, pas un ajout
    //  au fil de l'eau. C'est le listener qui vient s'y inscrire.
    this.events = new TsiEvents();
    //  ═══ LES ORGANES COMMUNS À TOUT NŒUD — Pièce, Face, Groupe (PD 2026-08-19) ═══
    //  Ils vivaient DUPLIQUÉS dans les deux constructeurs héritiers (posés au fil de
    //  l'eau, chacun dans la classe où le besoin apparaissait) : la même fonction de
    //  construction les pose désormais UNE fois, dans UN ordre — deux classes qui
    //  posent les mêmes champs dans des ordres différents fabriquent des formes
    //  divergentes. Et « ne jamais interdire ce qui n'est pas nécessaire d'interdire »
    //  (PD) : funcDeclar monte AUSSI — tout nœud sait porter des fonctions, qu'il
    //  s'en serve ou non.
    /** @type {TsiVars} vars */
    this.vars       = null;             // VARIABLES déclarées ICI — table posée par le build (bac-à-sable = ma branche)
    this.attrs      = {};               // ATTRIBUTS RUNTIME (état permanent) — champs nommés, décodés à la construction
    this.editor     = { attrs: {} };    // ESPACE ÉDITEUR (hors du temps de l'œuvre) — sa table d'attributs
    this.module     = null;             // provenance de module (⚠ plus jamais posé : expansion suspendue 2026-08-09)
    this.domListeners = null;           // ÉCOUTEURS DU DOM posés pour ce nœud (TsiDomListener[], PD 06/10) — décrochés par TsiDomListener.removeAll
    this.funcDeclar = {};               // FONCTIONS déclarées ICI — `function $nom(…){…}` dans un bloc ; résolution en cascade (exe)
    this.effect        = null;          // l'EFFET d'apparition par défaut de l'élément, `!<durée:…>` en tête (étape E-2)
    this.interpolation = null;          // l'INTERPOLATION par défaut de l'élément, `!<…>` en tête
    this.tag        = null;           // le TAG CANONIQUE (PD 21/08) — 'tsi-p'|'tsi-f'|'tsi-g'|'tsi-pf'|'tsi-pg', posé
                                        //   par chaque ctor concret. La notation à noms pleins (tsi-group/tsi-leaf) DÉDUIT la classe à la
                                        //   naissance ; le nœud SE SOUVIENT — tout dispatch lit ce champ, plus le localName.
    //  (macroNode — SUPPRIMÉ 2026-08-20, chantier exposition : rien ne se stocke.
    //   L'appartenance à une compression se DÉCLARE par les attributs $$rootCompressed
    //   / $$xl, et root + handler se CALCULENT à la construction de la vue — un champ
    //   mémorisé divergerait au premier déplacement du composant.)
  }
  // ═══════════════════════════════════════════════════════════════════════════
  //  LES TROIS GESTES DE CHEMIN — écrits en clair dans un bloc d'action
  // ═══════════════════════════════════════════════════════════════════════════
  //  Un bloc `{ … }` est du JavaScript : après son origine (`$this`, `$parent`,
  //  `$up(…)`), la descente se fait par de VRAIES méthodes, sur de vrais objets.
  //      $this.pieceChildren('menu').timeline.getTrack('pos').reduceToValue([10,10])
  //      $this.pieceChildren('menu').fc(_t[1])('pos')      ← fonction Tispi
  //      $this.pieceChildren('menu').var(_t[2]).valueJs    ← variable Tispi
  //  Ce qui n'est pas un membre JavaScript s'écrit entre parenthèses : le nom
  //  d'une Pièce est une DONNÉE (un id DOM), pas un identifiant.

  //  DESCENDRE D'UN CRAN — l'enfant nommé, dans la face courante ou la face
  //  indexée. C'est le geste d'un maillon de chemin, et il vit ICI et non dans le
  //  parseur : TsiValStep.get l'appelle pour un path réifié (valeur de key), un
  //  bloc l'écrit en clair. UNE implémentation, deux écritures.
  pieceChildren(nom, face = null) {
    const faceDiv = face != null ? this.div.children[face] : this.faceCurr;
    if (!faceDiv)
      TsiError.error(`path : face ${face != null ? `« ${face} »` : 'courante'} introuvable sous #${this.div?.id ?? '?'}`);
    //  JOKER → le lot des indicés. TERMINAL uniquement (PD 2026-08-18) : un lot au
    //  milieu d'une chaîne rendrait un Array, qui n'a aucun de ces trois gestes.
    //  En bout de chaîne, JavaScript prend le relais — `.forEach(p => …)`.
    if (nom.includes('$_$')) {
      const regex = new RegExp('^' + nom.split('$_$').map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\d+') + '$');
      const lot = [...faceDiv.children].filter(c => regex.test(c.id) && c._tsi).map(c => c._tsi);
      if (!lot.length) TsiError.error(`path : aucun composant au motif « ${nom} » sous #${faceDiv.id ?? '?'}`);
      return lot;
    }
    const cible = faceDiv.children[nom]?._tsi;
    if (!cible) TsiError.error(`path : composant « ${nom} » introuvable sous #${faceDiv.id ?? '?'}`);
    return cible;
  }

  //  UNE FONCTION TISPI SUR CE COMPOSANT — `fc` REND la fonction, elle ne l'appelle
  //  pas : les parenthèses de l'auteur font l'appel. La cible reste le RÉCEPTEUR,
  //  jamais un paramètre ; elle arrive au corps comme `_ctx_`, ce qui est déjà la
  //  convention de tous les corps (exe(nom, cur, params)).
  //  `f` est l'objet de la table, pas un nom : il PEUT mémoriser sa résolution —
  //  mesuré 5,3 ns contre 16,8 pour un nom en chaîne, la cascade ne se refaisant plus.
  //  L'ACCÈS AU DIV DEPUIS UN CHEMIN (PD 26/08) — dans un chemin, `.ident` nu est
  //  TOUJOURS la fille ; un membre s'atteint par une MÉTHODE, dont la parenthèse
  //  rend la main au JS : `$this.getDiv().id`. Pas d'écriture à double sens.
  getDiv() { return this.div; }
  //  (fc — SUPPRIMÉE à la coupe du 2026-08-26 : son unique client était l'ancien
  //   convertir ; l'appel direct vit dans fcJs, le modèle dans _t.)

  //  L'APPEL DIRECT d'une fonction tispi (parseur texte, PD 25/08) — `fn` est le
  //  COMPILÉ du modèle (TsiValFuncDeclar._fn), placé dans _t AU BUILD : pas de run,
  //  pas d'exe, pas d'objet neuf. Le récepteur devient `this` du corps — la CIBLE
  //  en bout de chemin — et ctx reste `_ctx_` : les deux accès, sans cas particulier.
  //      $fonc(a, b)          →  _ctx_.piece.fcJs(_ctx_, _t[N]._fn, a, b)
  //      $parent.fx.$fonc(a)  →  …toPiece('fx').fcJs(_ctx_, _t[N]._fn, a)
  fcJs(ctx, fn, ...params) { return fn.call(this, ctx, ...params); }

  //  LE MAILLON DE CHEMIN — le nom du script produit (chantier JS_Script, 6.2).
  //  UNE implémentation : pieceChildren porte déjà le joker, la face indexée et
  //  les erreurs nommées. La fusion des deux noms se tranchera à la coupe.
  toPiece(nom, face = null) { return this.pieceChildren(nom, face); }

  //  UNE VARIABLE TISPI SUR CE COMPOSANT — `var(tabVars, numVar)` reçoit LA TABLE
  //  du bloc et l'indice (PD 26/08), REND le lien (TsiVarRef sur MOI), et `.valueJs`
  //  porte l'opération : c'est JS qui décide entre lire et écrire, par la position.
  //  (`var` est un mot réservé, mais légal comme nom de méthode depuis ES5 — vérifié,
  //   y compris dans un corps compilé par new Function.)
  var(tabVars, numVar) { return new TsiVarRef(this, tabVars[numVar]); }

  //  DESTRUCTION du nœud — coupe TOUTES les racines qui le retiennent. Il faut les
  //  quatre : une seule qui subsiste garde en vie le nœud, sa timeline, ses pistes,
  //  leurs css et leurs animations. Tispi ne balayant jamais, rien ne le fera plus tard.
  //  (`supprValue(this.idUnic)` d'avant ne libérait RIEN : il attend une POSITION,
  //   pas le pointeur — la place restait occupée, donc le nœud vivant.)
  //  ⚠ DEUX ARBRES partent d'un nœud, et il faut les DEUX (mesuré 20/08) : les
  //  enfants DOM, et l'arbre INTERNE — attributs, variables, pistes, keys, valeurs.
  //  Ce second était ignoré : pistes et blocs d'action restaient inscrits, et comme
  //  chaque piste porte `this.piece`, elle DÉSIGNAIT encore le nœud retiré — le
  //  flush ne libérait donc rien du tout.
  //  Le flush n'est PAS distribué : c'est le PARCOURS qui l'est (messageComponents,
  //  une méthode par classe). Le flush reste un message, porté jusqu'aux valeurs —
  //  d'où la ligne 2, la même qui servira aux messages suivants.
  flush() {
    for (const childDiv of this.div.children ?? [])      // 1 — LA BRANCHE : chaque descendant
      (childDiv._tsi ?? childDiv._tsiFace)?.flush();     //     occupe sa propre place
    this.messageComponents(c => { c.idUnic?.remove(); });// 2 — L'ARBRE INTERNE : ce qui occupe une place
    this.events.clear();                                 // 3 — mes abonnés
    this.idUnic?.remove();                               // 4 — LE REGISTRE (remet idUnic à null)
    this.div._tsi = this.div._tsiFace = null;            // 5 — LE DOM : sans ça, div._tsi retient
  }

  /**
   * Remonte l'arbre de PIÈCE EN PIÈCE ; callBack(ancêtre, parameters) pilote
   * (continue / break / valeur de retour).
   *
   * Le pas de la boucle est getPieceParent(), spécialisé par classe : une Face rend sa
   * Pièce (un seul niveau), une Pièce rend sa Pièce ancêtre en traversant au besoin un
   * conteneur. Les Faces rencontrées en chemin ne sont donc JAMAIS candidates — elles ne
   * servent qu'à atteindre la Pièce au-dessus. Depuis une Face, le premier candidat est
   * sa propre Pièce.
   */
  getAncestor(callBack, parameters) {
    for (let p = this.getPieceParent(); p; p = p.getPieceParent()) {
      const result = callBack(p, parameters);
      if (!result || result === 'continue') continue;
      if (result === 'break') break;
      return result;
    }
    return undefined;
  }
  getNamedAncestor(name) { return this.getAncestor((p, name) => p.div.id === name ? p : 'continue', name); }
  //  LES SŒURS DU PLATEAU (PD 07/10) : les autres Pièces de mon plateau — la portée des noms `$_…`.
  *platePieces() {
    for (const c of this.div.parentNode?.children ?? [])
      if (c !== this.div && c._tsi?.isPiece) yield c._tsi;
  }


  debuildDataTsi(ctx) { }                    // vide au parent — chaque forme dit son contenu
  debuildHeader(ctx) {
    o_.projet?.attrs?.debuildAttrs(ctx, this);               // 1 — attrs (séries codées), EN TÊTE — écrit ctx.dt (mémoire de la sauvegarde)
    for (const var_ of this.vars?.values() ?? [])            // 2 — vars, valeur COURANTE
      { var_.debuild(ctx); ctx.dt += '\n'; }                 //     accès AVEUGLE — la forme écrit SA source (+ ';' d'item)
    for (const f of Object.values(this.funcDeclar ?? {}))    // 2b — fonctions déclarées EN TÊTE (celles d'un bloc voyagent dans leur bloc)
      if (f.fromHead) ctx.dt += f.src + '\n';
    if (this.effect)        ctx.dt += '!' + this.effect.debuild() + ' ';          // 3 — transitions d'élément : l'effet
    if (this.interpolation) ctx.dt += '!' + this.interpolation.debuild() + ' ';   //     puis l'interpolation

  } 
  /**
 * @param {TsiTrack[]} tracks
 * @param {{out: string, dt: string}} ctx
 */
  debuildTracks(tracks, ctx) {
    for (let i = 0; i < tracks.length; i++) {
      const t = tracks[i];
      if (t._synth) continue;                                // re-générée au build
      //  RECOLLAGE D'UNE MACRO DE PISTES : la provenance est `macros`, la pile
      //  [nom, target] copiée à la naissance ; [0] = le 1er niveau, le plus extérieur.
      //  target 1 = PISTES (0 = keys). Une macro ayant pu produire PLUSIEURS pistes,
      //  son nom s'écrit UNE fois et la boucle CONSOME les siennes — contiguës par
      //  construction, l'incrustation étant textuelle en un seul point.
      //  (Le sigil vit dans le nom : `$m` est stocké tel quel.)
      const macro = t.macros?.[0];
      if (macro && macro[1] === 1) {
        ctx.dt += macro[0] + '; ';
        while (i + 1 < tracks.length &&
               tracks[i + 1].macros?.[0]?.[0] === macro[0]) i++;
        continue;
      }

      this.debuildTrack(t, ctx); ctx.dt += ' ';
    }
  }
  //  LE CROCHET PAR-PISTE — surchargé par la FACE, qui re-fusionne la section
  //  `out` de sa jumelle derrière la piste IN.
  debuildTrack(t, ctx) { t.debuild(ctx); }
  //  (debuildChildren SUPPRIMÉE 2026-08-15 — elle doublait la boucle d'enfants
  //   d'exportBranch (tispiBuild.js), restée SANS APPELANT depuis la disparition
  //   de TsiNode.debuild(ctx). Le verbatim entrelacé vit là-bas, en un seul
  //   endroit : enfant Tispi → récursion, tout le reste → cargaison à sa place.)

  //  À SURVEILLER (PD 05/10) — jusqu'au 05/10 les deux balayages ci-dessous ajoutaient la div du plateau ELLE-MÊME à la liste des
  //  porteurs quand c'était une Face à timeline (doctrine « plateau-de-face » du 19/06, horloge sur la Face — abolie le 24/06) :
  //  l'horloge d'une Pièce fille rejouait alors la key 0 des propres pistes de sa Face-groupe à chaque tour (fade de `ferme`
  //  rejoué, demo_react). Les propres pistes d'une Face sont jouées par setActivePlate / setInactive. Si un cas réclame un jour
  //  que la Face-groupe parente (non Pièce, avec timeline) soit associée au balayage de ses Pièces filles, ce signal le dira :
  //  un avertissement console, UNE fois par Face, à son premier balayage.
  static _watchFacePlate(plateDiv) {
    const face = plateDiv._tsi;
    if (!face || face.isPiece || !face.timeline?.tracks.length || face._platesweepSeen) return;
    face._platesweepSeen = true;
    TsiLang.warn('facePlateSweep', { id: plateDiv.id || '(sans id)', n: face.timeline.tracks.length });
  }
  /** Traite les pistes de ce nœud et de tous ses frères du même plateau. */
  messageAllTracks(onTrack) {
    const plateDiv = this.getPlateDiv();
    TsiNode._watchFacePlate(plateDiv);
    const holders = plateDiv.children;   // ce nœud et ses frères : les ENFANTS de la div du plateau, jamais la div elle-même (PD 05/10)
    for (const childDiv of holders) {
        if (!childDiv._tsi || childDiv._tsi.timeline==null) continue;
        for (const track of childDiv._tsi.timeline.tracks) {
            const result = onTrack(track);
            if (!result || result === 'continue') continue;
            if (result === 'break') break;
            return result;
        }
    }
  }
  /** ⚠ LA STRUCTURE EST ÉNUMÉRÉE EN DUR — un champ porteur ajouté serait ignoré EN
   *  SILENCE. CE N'EST PAS UNE CRAINTE THÉORIQUE : mesuré le 2026-08-20, QUATRE
   *  porteurs manquaient déjà — `funcDeclar` (posé sur TsiNode la VEILLE, oublié par
   *  ce balayeur écrit le LENDEMAIN), `key.interpolation`/`showEffect` (qui mènent à
   *  un TsiValEase, donc à une VALEUR), `attr.producer`, et `macroAction.action`.
   *  Les quatre sont branchés ; la démonstration, elle, reste valable.
   *
   *  ✅ LE GARDE-FOU EST POSÉ — banc_balayage (scratchpad) : il compare ce que ce
   *  diffuseur ATTEINT à ce qu'un crawl générique TROUVE dans un nœud riche, et sort
   *  la liste des champs manquants. Rien à tenir à jour, rien qui puisse mentir —
   *  c'est un banc, pas un document ; il casse au premier organe oublié. Les objets
   *  TRAVERSÉS sans être annoncés (TsiTimeline conteneur, TsiTransition dont seul
   *  l'ease est un composant) y sont déclarés avec leur raison, pas exclus en douce.
   *
   *  ⚠ MAIS UN BANC DE COUVERTURE NE VAUT QUE PAR SON ÉCHANTILLON — le sien a
   *  MENTI deux fois le 2026-08-20, en disant « aucun trou » alors qu'il en restait :
   *    · son bloc d'action était TRIVIAL (`{ x = 1; }`) donc sa table `_t` VIDE —
   *      il ne prouvait rien sur la descente DANS un bloc (2 composants manquants) ;
   *    · son crawl s'arrêtait à la PROFONDEUR 7, avant `path.chain` (2 de plus).
   *  Corrigés (échantillon avec path + variable, profondeur 20). Il reste que
   *  « aucun trou » ne vaut QUE pour ce que l'échantillon contient : ni module, ni
   *  événements, ni horloge, ni face avec section out n'y figurent encore.
   *
   *  ⏸ RESTE la forme en DONNÉE (TsiTrackStruct, cf. le TODO en tête de TsiTrack) :
   *  déclarer les porteurs plutôt que les parcourir en code. Les formes envisagées :
   *    · (PD) une DOC centralisée de la structure, VERSIONNÉE ; tout balayeur
   *      vérifie sa version avant de traiter → la divergence devient bruyante.
   *      Réserve : rien ne lie mécaniquement la doc au code — qui ajoute un champ
   *      sans incrémenter laisse doc et balayeurs d'accord sur une structure qui a
   *      changé. Garde-fou HUMAIN.
   *    · que CHAQUE CLASSE déclare ses porteurs — `messageComponents(onComp)` sur
   *      TsiNode / TsiTrack / TsiKey, chacune visitant SES champs et déléguant plus
   *      bas ; ce diffuseur devient le point d'entrée. Même principe que `debuild`
   *      (contrat unique, aveugle : chaque composant sait écrire SA source).
   *      Ajouter un porteur = une ligne DANS sa classe, à côté de sa déclaration au
   *      ctor : la description ne peut plus diverger de ce qu'elle décrit.
   *      ⚠ Ce n'est PAS la cascade écartée le 20/08 (un flush par classe, une
   *      méthode par message) : ici UNE seule méthode de parcours, le message reste
   *      un paramètre — le balayage au balayeur, la structure à chaque classe.
   *    · et la doc centrale ENGENDRÉE depuis ces déclarations (comme attrsCode, la
   *      table auto-décrite publiée avec le document) : une doc dérivée ne ment pas.
   *
   *  Traite TOUS les composants internes de CE nœud — la profondeur qui manquait
   *  aux autres diffuseurs (PD 2026-08-20). messageAllTracks s'arrête aux pistes du
   *  plateau ; celui-ci descend l'arbre INTERNE d'un seul nœud, jusqu'aux valeurs :
   *
   *      attrs → editor.attrs → vars → timelines → pistes → keys → valeurs
   *
   *  PORTÉE : ce nœud SEUL. L'appelant compose — `flush` descend déjà l'arbre DOM,
   *  il n'a pas à le refaire ici (le balayage appartient aux fonctions de balayage).
   *  ORDRE : naturel. Aucune contrainte de séquence — l'undo photographie l'arbre
   *  entier par le debuild, il n'y a pas d'inverses à ordonner (PD).
   *  `kind` dit la famille : 'attr' | 'var' | 'track' | 'key' | 'value' — qui n'a
   *  besoin que d'une sorte trie, le flush les prend toutes.
   *  Retour, comme toute la famille : rien|'continue' poursuit, 'break' arrête la
   *  boucle en cours, toute autre valeur REMONTE (le balayeur rend ce qu'on a trouvé).
   */
  messageAllComponents(onComp) { return this.messageComponents(onComp); }

  //  MES PORTEURS : mes attributs (des deux espaces), mes variables, mes pistes —
  //  chacun visitant les siens. Contrat aveugle : je ne sais pas ce qu'ils portent.
  messageComponents(onComp) {
    for (const table of [this.attrs, this.editor?.attrs])
      for (const nom in table ?? {}) {
        const r = onComp(table[nom], 'attr'); if (r && r !== 'continue') return r;
        const w = table[nom].messageComponents(onComp); if (w) return w;
      }
    for (const v of this.vars?.values() ?? []) {
      const r = onComp(v, 'var'); if (r && r !== 'continue') return r;
      const w = v.messageComponents?.(onComp); if (w) return w;
    }
    //  LES FONCTIONS DÉCLARÉES — `function $nom(…){…}` écrit dans un bloc, déposé
    //  ici par TsiValFuncDeclar. Cinquième organe de TsiNode (PD 19/08), OUBLIÉ du
    //  balayeur écrit le lendemain : la démonstration du défaut que signale le TODO
    //  ci-dessous — une structure ÉNUMÉRÉE EN DUR ignore en SILENCE tout champ neuf.
    for (const nom in this.funcDeclar ?? {}) {
      const f = this.funcDeclar[nom];
      const r = onComp(f, 'value'); if (r && r !== 'continue') return r;
      const w = f.messageComponents?.(onComp); if (w) return w;
    }
    for (const tl of [this.timeline, this.timelineOut])
      for (const t of tl?.tracks ?? []) {
        const r = onComp(t, 'track'); if (r && r !== 'continue') return r;
        const w = t.messageComponents(onComp); if (w) return w;
      }
  }

  /** Traite les keys (à frameNum) de ce nœud et de tous ses frères du même plateau. */
  messageAllKeys(frameNum, onKey) {
    const plateDiv = this.getPlateDiv();
    TsiNode._watchFacePlate(plateDiv);
    const holders = plateDiv.children;   // ce nœud et ses frères : les ENFANTS de la div du plateau, jamais la div elle-même (PD 05/10)
    for (const childDiv of holders) {
        if (!childDiv._tsi || childDiv._tsi.timeline==null) continue;
        for (const track of childDiv._tsi.timeline.tracks) {
            const keyIndex = track.searchKey(frameNum);
            const result   = onKey(track.keys[keyIndex], keyIndex, track.keys, track);
            if (!result || result === 'continue') continue;
            if (result === 'break') break;
            return result;
        }
    }
  }
  messageTree(onEnterPiece, onExitPiece, onEnterFace, onExitFace, params) {
    if (params.depth===undefined) params.depth=0;
    params.depth++;
    const divMemo = params.component;
  
    const flagNext = this.messagePlate(onEnterPiece, onExitPiece, onEnterFace, onExitFace, params);
  
    params.component = divMemo;
    params.depth--;
    
    return flagNext;
  }
}
  
  
  
  
  


//     ##########     ####    ###########     #########     ###########   
//     ####    ####   ####    ####           ####    ####   ####          
//     ####    ####   ####    ####           ####           ####          
//     ##########     ####    ##########     ####           ##########    
//     ####           ####    ####           ####           ####          
//     ####           ####    ####           ####    ####   ####          
//     ####           ####    ###########     #########     ###########   


/**
 * Traitement des composants communs à un plateau de pièce
 */
// (classe TsiPlate DISSOUTE — PD 2026-07-09 : ses statiques d'horloge vivent sur
//  TsiTrackClock (tempo, accumulateur règle A, createClock, CLOCK_NAME), les
//  walkers message* sur TsiNode ;  Une classe-« autorité plateau » induisait en erreur.)
  
  
// ═════════════════════════════════════════════════════════════
//  PIECE
// ═════════════════════════════════════════════════════════════

class TsiPiece  extends TsiNode{
  static piecesPt = new TsiComposPt();   // registre de toutes les Pièces (TsiPiece) du runtime — indexées par idUnic

  //  LES ÉCRITURES EXPLICITES d'une Pièce (PD 31/08) : `tsi-p` (canonique interne),
  //  `tsi-morph` (la succession — &face) et `tsi-pilot` (la paire délibérée sans
  //  succession) — même callback, même builder, même estampille (`node.tag === 'tsi-p'`).
  //  Le nom dit ce que la chose FAIT : morph prend des formes ; pilot porte le temps
  //  ou les services pour d'autres. (Les préfixes div-* sont SUPPRIMÉS — 31/08.)
  //  Sur un nœud VIVANT, la nature se lit sur l'OBJET (`node.tag`, `isPiece`) ;
  //  cet ensemble ne sert qu'aux documents INERTES (DOMParser : graftGroup, coller).
  //  L'export émet `el.localName` tel quel : chaque page GARDE sa notation.
  static tags = new Set(['tsi-p', 'div-m']);
  /**
   * @param {Element} div — la div HTML de la Pièce. SEUL paramètre : la Pièce naît
   *   NUE (identité + registre) et reçoit tout son contenu du BUILD.
   *
   * Ce que le ctor pose, et rien d’autre :
   *   div._tsi = this · idUnic (inscription au registre TsiPiece.piecesPt)
   *   timeline = null      → le réceptacle vient de TsiBuilder.openTimelines()
   *   animDuration = 1     → ajustée ensuite par TsiTrackClock.setPlateDurationTempo
   *   attrs / editor.attrs / vars / module / ptClock : vides, remplis au build
   *   style.position = absolute
   *
   * 2026-08-09 : la doc précédente décrivait la signature (div, a, b) et la TABLE
   * PLATE des pistes (`new TsiPiece(div, [-3, [300,"easeout"]], [["pos", 0,…]])`).
   * Cette API est morte avec la construction directe : le data-tsi est lu au fil
   * du flux par TsiBuilder, il n’existe plus de table intermédiaire.
   * @param {TsiVars} vars — la table de variables locales (bac-à-sable) de la Pièce, posée par le build
   */
  constructor(div) {
    super(div);
    //  (vars, attrs, editor, module, funcDeclar : posés par TsiNode — les organes
    //   COMMUNS vivent chez l'ancêtre, une fois, dans un ordre unique. PD 19/08.)
    this.isPiece = true;
    div._tsi     = this;
    this.tag     = 'tsi-p';             // tag CANONIQUE (les héritiers fusionnés surchargent)
    this.timeline  = null;
    this.animDuration       = 1;
    this.faceCurr           = null;
    this.macros              = null;       // macros locales (nom → TsiMacro) — la Pièce est le publiant, les macros sont des scripts de la Pièce. Le build les installe dans la table macros (tispiBuild.js:212).
                                          //   alimentée par TsiMacroOpen/Close au fil du walk (tispiBuild.js:686) : l'incrustation
                                          //   de macro est devenue TEXTUELLE (insertMacro), il n'y a plus de pile pistes/keys.
    this.div.style.position = 'absolute';
    this.posUnlock = false;              // PRISE EN MAIN de la position (drag) : true = les goto de la SEULE
                                          //   piste `pos` sont inhibés (gardes en tête de TsiTrack.gotoPlay/gotoStop),
                                          //   le style inline a la main. Les Pièces FILLES ne sont pas concernées
                                          //   (chaque piste teste SA pièce). PD 2026-08-16.
    this.align = null;                   // service de mémorisation de l'alignement. Exemple : alignArea
    this.ptClock = null;                  // horloge du plateau (créée paresseusement par TsiTrackClock.createClock)
    this.isEditor = false;                  // true si la Pièce est un éditeur (ex. TsiEditor) — les éditeurs ne sont pas des faces
  }
  getPieceParent() {
    let d = this.div.parentNode;
    if (d == null) return null;
    if (d._tsi?.isPiece) return d._tsi;
    d = d.parentNode;                      // le GRAND-parent
    if (d == null) return null ;
    return d._tsi?.isPiece ? d._tsi : null;
  }

  // ── DEBUILD : le CONTENU du data-tsi d'une Pièce, dans l'ordre que buildHead LIT —
  //  attrs → vars → !transit → pistes. (L'ancien TsiDecompiler.dataTsi émettait vars
  //  PUIS attrs : la zone d'attributs, qui ne se détecte qu'en TÊTE — « commence par
  //  un chiffre » — était PERDUE à la relecture ; et ses early-returns jetaient attrs
  //  et vars dès que la Pièce n'avait pas de piste émettable. Mesuré 2026-08-12,
  //  trois passes.)
  debuildDataTsi(ctx) {
    this.debuildHeader(ctx) ; // traité par le parent TsiNode, qui sait que vars et transit sont des enfants de la Pièce
    // ── 4 — LES PISTES ──
    //  Boucle INDEXÉE : le recollage d'une macro doit pouvoir AVANCER (sauter les
    //  pistes suivantes du même nom), ce qu'un for…of ne permet pas.
    const tracks = this.timeline?.tracks ?? [];
    this.debuildTracks(tracks, ctx);
    ctx.dt += '&';                                           // borne de séquence (buildTracks tispiBuild.js:247)
  }

  getAnimDuration(){return this.animDuration;}
  setPlateDuration(newLen) { this.ptClock?.setPlateDuration(newLen); }

  /** Importe une branche (module Face/Group) DANS cette Pièce, à la volée pendant
   *  le run : lit le fichier HTML (async), puis délègue la greffe. La branche est
   *  SON PROPRE plateau autonome ; on n'insère qu'une key dans la piste face.
   *  I/O PUR — aucune borne d'undo ici : le fetch est async, il ne peut pas être
   *  englobé dans une transaction synchrone ; les record de la greffe rejoignent
   *  le cran ouvert par la dernière balise d'action (pile PLATE).
   *  Déplacée de o_.functions.importGroup_ le 2026-08-11 : la Pièce était son 3e
   *  argument. L'action `importGroup` reste sa face DSL et délègue ici.
   *  @param {string} url       fichier HTML de branche (racine tsi-f/tsi-g)
   *  @param {string} faceName  id donné à la racine → adressée par cet id
   *  @param {number} time      frame de la piste face où la branche apparaît
   *  @returns {Promise<Element>} la racine greffée */
  async importGroup(url, faceName, time) {
    const html = await (await fetch(url)).text();   // page complète OU fragment (graftGroup extrait la racine)
    return this.graftGroup(html, faceName, time);
  }

  /** Greffe dans CETTE Pièce un HTML de branche DÉJÀ LU (aucune I/O) : bâtit son
   *  plateau autonome dormant, insère la key face, active si le curseur est en zone.
   *  Réutilisable avec un HTML de n’importe quelle source (string, <template>,
   *  éditeur…), pas seulement un fetch — d’où sa séparation d’avec importGroup,
   *  qui n’est que le fetch devant elle.
   *  Déplacée de o_.functions le 2026-08-11 : la Pièce était son 3e argument.
   *  @returns {Element|null} la racine greffée, ou null si le HTML ne porte pas de branche */
  graftGroup(html, faceName, time) {
    // Règle C (PD 2026-07-07) : un import AU-DELÀ de la durée ALLONGE le plateau
    // (comme à l'init : la piste la plus longue prime) — plus de refus. Le geste
    // passe par l'ATOME setPlateDuration (undo + re-projection plateau-wide).
    if (time < 0) { alert(`importGroup : temps ${time} négatif — import refusé.`); return null; }
    const len = this.ptClock?.animDuration;
    if (len != null && time + 1 > len) this.setPlateDuration(time + 1);

    // 1 ─ Extraire la source — DEUX FORMATS (enfants DIRECTS à chaque niveau, pas
    //     de sélecteur : querySelector plongerait à n'importe quelle profondeur) :
    //     • BRANCHE (format export) : tsi-p > tsi-f|tsi-g — la face donnée ;
    //     • CANON DE PAGE : body > tsi-g — l'ESPACE de la page (porte le nom de
    //       l'appli) EST la face-groupe à greffer, telle quelle. Composition
    //       fractale : toute page est un groupe, pas d'« ouvrir projet ».
    //     Le outerHTML est ré-inséré dans le document courant → connectedCallback compile.
    const KIND   = ['tsi-f', 'tsi-g'];
    const doc    = new DOMParser().parseFromString(html, 'text/html');
    const srcTsiP = [...doc.body.children].find(el => TsiPiece.tags.has(el.localName));
    let src = srcTsiP && [...srcTsiP.children].find(el => KIND.includes(el.localName));
    src ??= [...doc.body.children].find(el => el.localName === 'tsi-g');   // canon de page
    if (!src) { alert('graftGroup : ni branche (tsi-p > tsi-f/tsi-g) ni groupe racine (canon de page) dans le HTML.'); return null; }

    // 1b ─ FONCTIONS EMBARQUÉES : les <script data-tsi-funcs> de la source
    //      (compartiments func_<doc>/func_<module> émis par exportFunctions) sont
    //      INERTES via insertAdjacentHTML → on les exécute ICI, AVANT la greffe
    //      (les actions résolvent au run, mais autant que les registres soient
    //      prêts d'emblée). Importer une appli = exécuter son code — assumé.
    for (const s of [...doc.scripts])
      if (s.hasAttribute('data-tsi-funcs')) new Function(s.textContent)();

    // Re-import IDEMPOTENT : une face de même id déjà greffée est DÉCROCHÉE + PURGÉE
    // (setInactive de son plateau autonome = stop horloge + cancel _anim/timers ;
    // idempotent si dormant) avant d'en greffer une neuve — sinon les doublons
    // s'accumulent dans le DOM à chaque ré-appel (cf. &onTime qui re-tire par tour).
    const already = [...this.div.children].find(c => c.id === faceName && c._tsiFace);
    if (already) {
      already._tsiFace.onePiece?.()?.ptClock?.setInactive?.();   // purger le plateau
      already.remove();                                          // décrocher du DOM
    }

    this.div.insertAdjacentHTML('beforeend', src.outerHTML);
    const root = this.div.lastElementChild;
    root.id = faceName;                                // la face s'adresse par son id (:scope > #id)

    // 2 ─ Plateau AUTONOME de la branche, bâti DORMANT. Phase A LOCALE, ctx frais.
    const ctx = TsiBuild.createStartContext();
    root._tsiFace.messagePlate(TsiBuild.preparePiece, null,
                               TsiBuild.prepareFace,  TsiBuild.faceQuit, ctx);

    // 3 ─ Insérer la key face (time → faceName). insertKey pose la donnée ET
    //     réconcilie la piste : c'est SA responsabilité (elle mute la table), pas
    //     celle de l'import.
    const faceTrack = this.timeline.getTrack('face');
    // TODO : Pièce sans piste-face (faceTrack == null) → la créer. Pour l'instant on la suppose présente.
    faceTrack.insertKey(time, faceName);

    return root;
  }
   
  /**
   * Écrit une taille — l'API du pipe géométrique (PD 2026-07-10).
   *  - setSize(lg, ht, numFrame) : key DATÉE sur la piste &size de la Pièce
   *    (créée si absente — et dans ce cas le pipe notifie la face directement) ;
   *  - setSize(lg, ht) SANS frame : taille DANS LA FACE (hors temps) ;
   *  - sentinelle -1,-1 : résolue À L'APPEL — la face répond sa mesure par le
   *    pipe, la table ne stocke que des NOMBRES (geste instantané, ≠ du
   *    `&size -1,-1` source qui reste sentinelle et se résout à l'apparition).
   * @returns {number[]|null} la taille appliquée
   */
  setSize(lg, ht, numFrame) {
    const face = this.getFaceCurr?.()?._tsiFace ?? this.face ?? null;
    if (lg === -1 && ht === -1) {                    // résolution à l'appel
      const rep = face?.sizeChanged?.([-1, -1]);
      if (!rep) { TsiError.debug('setSize(-1,-1) : aucun fournisseur (face absente ou non mesurable)'); return null; }
      [lg, ht] = rep;
    }
    if (numFrame === undefined) {                    // taille DANS LA FACE (hors temps)
      if (!face?.div) return null;
      face.div.style.width  = lg + 'px';
      face.div.style.height = ht + 'px';
      face.sizeChanged?.([lg, ht]);                  // les concerns réagissent (autoSize se supprime)
      return [lg, ht];
    }
    let track = this.timeline.getTrack('size');
    if (!track) {                                    // <éditeur> piste &size née du geste
      track = new o_.css.size.track('size', this);
      track.buildTrack(['size', numFrame, [lg, ht]]);
      this.timeline.setTrack(track);                 // pose gardée (anti-doublon)
      face?.sizeChanged?.([lg, ht]);                 // pas encore d'émetteur-piste → notifier ici
      //  APPLIQUE-TOI (PD 2026-08-23) — la seule chose que la piste neuve doive à
      //  l'écran. L'ancien bloc déroulait la machinerie complète (`if (clock)` +
      //  dispatch gotoStop/gotoPlay) : ANALYSÉE ligne à ligne, elle dégénérait tout
      //  entière en ce setKeyValue — une piste MONO-KEY est constante partout
      //  (searchKey CLAMPE à la première key, même avant son numFrame), sa key
      //  unique est aussi la dernière (rien à armer), et `frame` était un paramètre
      //  MORT dans gotoInfo. La key, on la tient : on vient de la construire.
      track.keys[0].setKeyValue(track);
    } else {
      track.insertKey(numFrame, [lg, ht]);   // atome existant (undo + re-projection)
    }
    return [lg, ht];
  }

  // Change la LONGUEUR du plateau — plus grand ou plus petit. Op PLATEAU (la
  // longueur est commune aux Pièces sœurs). Rétrécir peut supprimer les keys
  // au-delà de newLen → même décision qu'insertFrames : 0/1 silencieux, 2 refus,
  // 3 demande. Suppressions AVANT setPlateDuration (les regotos intermédiaires
  // doivent voir l'ancienne longueur), cascade de re-projection par setPlateDuration.
  setFrameLength(newLen, flagSuppr = 0) {
    const len = this.ptClock?.animDuration ?? this.getAnimDuration();
    if (newLen === len) return true;
    if (newLen < len) {
      if (flagSuppr > 0) {
        const hit = this.messageAllTracks(t => t.keyBeyond(newLen) ? 'hit' : 'continue');
        if (hit && TsiTrack.decideOverflow(flagSuppr) === 0) return false;
      }
      this.messageAllTracks(t => { t._supprBeyond(newLen); });
    }
    this.setPlateDuration(newLen);
    return true;
  }

  // ══ insertFrames ══════════════════════════════════════════════════════════

  // PORTÉE PIÈCE (toutes les pistes de cette Pièce).
  // Flag 0 : allonge le temps de TOUT le plateau. Sinon : scan + décision UNE fois,
  // puis dispatch décalage pur / avec suppressions.
  insertFrames(P, N, flagLenFixe = 0) {
    if (flagLenFixe == 0) {
      this.setPlateDuration((this.ptClock?.animDuration ?? this.getAnimDuration()) + N);
    } else {
      switch (this.keyOutOfLimits(P, N, flagLenFixe)) {
        case 0: return false;
        case 2: for (const track of this.timeline.tracks) track._insertFramesSuppr(P, N); return true;
      }
    }
    for (const track of this.timeline.tracks) track._insertFrames(P, N);
    return true;
  }

  // Prédiction + décision : 0 = refus, 1 = décalage pur, 2 = avec suppressions.
  // UNE décision (une alert) pour toutes les pistes.
  keyOutOfLimits(P, N, flagLenFixe) {
    for (const track of this.timeline.tracks)
      if (track.keyOutOfLimit(P, N)) return TsiTrack.decideOverflow(flagLenFixe);
    return 1;
  }

  // PORTÉE PLATEAU (la Pièce et ses sœurs, via messageAllTracks).
  // UNE décision, UNE alert pour tout le plateau.
  insertFramesPlate(P, N, flagLenFixe = 0) {
    if (flagLenFixe == 0) {
      this.setPlateDuration((this.ptClock?.animDuration ?? this.getAnimDuration()) + N);
    } else {
      const overflow = this.messageAllTracks(t => t.keyOutOfLimit(P, N) ? 'overflow' : 'continue');
      if (overflow) switch (TsiTrack.decideOverflow(flagLenFixe)) {
        case 0: return false;
        case 2: this.messageAllTracks(t => { t._insertFramesSuppr(P, N); }); return true;
      }
    }
    this.messageAllTracks(t => { t._insertFrames(P, N); });
    return true;
  }

  // ══ supprFrames ═════════════════════════════════════════════════════════

  // Scan gratuit + décision UNE fois (une alert pour toutes les pistes).
  keysInZone(P, N, flagSuppr) {
    for (const track of this.timeline.tracks)
      if (track.keyInZone(P, N)) return TsiTrack.decideSuppr(flagSuppr);
    return 1;
  }

  // PORTÉE PIÈCE. Raccourcit le temps de TOUT le plateau (setPlateDuration en dernier).
  supprFrames(P, N, flagSuppr = 0) {
    const len = this.ptClock?.animDuration ?? this.getAnimDuration();
    if (P + N > len) N = len - P;
    if (N <= 0) return false;
    if (flagSuppr > 0 && this.keysInZone(P, N, flagSuppr) === 0) return false;
    for (const track of this.timeline.tracks) track._supprFrames(P, N);
    this.setPlateDuration(len - N);
    return true;
  }

  // PORTÉE PLATEAU (la Pièce et ses sœurs, via messageAllTracks).
  // UNE décision, UNE alert pour tout le plateau.
  supprFramesPlate(P, N, flagSuppr = 0) {
    const len = this.ptClock?.animDuration ?? this.getAnimDuration();
    if (P + N > len) N = len - P;
    if (N <= 0) return false;
    if (flagSuppr > 0) {
      const hit = this.messageAllTracks(t => t.keyInZone(P, N) ? 'hit' : 'continue');
      if (hit && TsiTrack.decideSuppr(flagSuppr) === 0) return false;
    }
    this.messageAllTracks(t => { t._supprFrames(P, N); });
    this.setPlateDuration(len - N);
    return true;
  }
  getFacesNode() {
      if (this.face) return null;
      let faces = [];
      for(const childDiv of this.div.children){
          if(childDiv._tsiFace!==undefined) faces.push(childDiv._tsiFace);
      }
      return faces;
  } 
  processFaces(callBack, params){
      const faces = this.getFacesNode();
      for(const face of faces){
          callBack(face, params);
      }
  }
  getFaceCurr(){
      return this.faceCurr;
  }
  //  LA PIÈCE FILLE — le plateau d'états d'un comportement (drag : $$drag = 2).
  //  Elle vit dans la face COURANTE, par la règle n°1 : Pièce > Face > Pièces filles.
  //  Lecture DIRECTE des enfants de la face : TsiFace.getPieces() rend null (une
  //  face nue est une feuille) et cette doctrine ne bouge pas.
  //  Une face simple n'a pas de Pièce fille → null, et le comportement n'a pas de
  //  plateau d'états. C'est un cas NORMAL, pas une erreur.
  onePiece() {
    for (const childDiv of this.getFaceCurr()?.children ?? [])
      if (childDiv._tsi) return childDiv._tsi;
    return null;
  }
  /** Accède à la div du groupe parent pour rechercher un frère, ou récupérer clock-memo de l'initialisation. (PD 05/10) */
  getPlateDiv()        {return this.div.parentNode;}
  
  //  getAncestor / getNamedAncestor sont montées sur TsiNode (l.26) : le parcours est le
  //  même pour une Pièce et pour une Face, seul le PREMIER PAS diffère — et il est déjà
  //  spécialisé par le getPieceParent() de chacune.



  /**
   * Piste face IMPLICITE : si la Pièce n'a pas de piste 'face' déclarée et
   * possède exactement UNE face enfant, synthétise `["face", 0, faceId]`
   * pour l'afficher. Permet d'omettre `&face` quand la face est unique.
   *
   * DOM-dépendant + timing-dépendant : appelée au balayage de start (TsiBuild.preparePiece),
   * quand les faces enfants sont construites — pas à la construction de la Pièce
   * (les <div> de face suivent le <script> dans le flux HTML). Bénéficie aux 3
   * formats (tableau / script-tispi / data-tsi) puisqu'en aval de la timeline.
   */
  ensureFaceTrack() {
    if (!this.timeline) return;          // pièce jamais construite (data-tsi absent ou en erreur) : statique, pas un crash
    if (this.timeline.getTrack('face')) return;

    const faces = [...this.div.children].filter(
      c => c._tsiFace != null && c._tsi === c._tsiFace
    );
  
    if (faces.length !== 1 || !faces[0].id) return;
  
    const track = new o_.css.face.track('face', this);
    track.buildTrack(['face', 0, new TsiValConst(faces[0].id)]);   // valeur synthétisée → réifiée (règle universelle)
    track._synth = true;             // synthétisée → exclue de l'export (re-générée au build)
    this.timeline.tracks.unshift(track);
  }
   /*
  ensureFaceTrack() {
    if (this.timeline.getTrack('face')) return;
    // Faces PURES uniquement : un enfant tsi-pf/tsi-pg porte _tsiFace (sa face
    // interne, posée :2022) MAIS AUSSI _tsi (c'est une Pièce, posé :1804) → on
    // l'exclut. Sinon une Pièce enfant unique id'ée serait prise pour la face
    // implicite du parent → fausse piste &face → le parent (ex. tsi-pg) disparaît.
    const faces = [...this.div.children].filter(c => c._tsiFace != null && c._tsi == null);
    if (faces.length !== 1 || !faces[0].id) return;     // 0, >1, ou enfant-Pièce → &face requis
    const track = new (o_.css.face.track)(['face', 0, faces[0].id], this);
    this.timeline.tracks.unshift(track);                 // face activée en premier
  }
  */
  messagePieceTree(onEnterPiece, onExitPiece, onEnterPlate, onLeavePlate, params) {
    const status = (onEnterPiece)? onEnterPiece(this, params):"continue";
    if (status === 'break') return 'break';
    if (status === 'error') return 'error';
    const faces =[];
    if(this.div._tsiFace != null){
      faces.push(this.face);
    }else{
      for (const childDiv of this.div.children) {
        if (childDiv._tsiFace != null) faces.push(childDiv._tsiFace);
      }
    }
    let result = "continue";
    for(const face of faces){
      const pieces = face.getPieces();
      if(pieces && pieces.length){
        onEnterPlate?.(pieces[0], params);
        for (const piece of pieces) {
          result = piece.messagePieceTree(onEnterPiece, onExitPiece, onEnterPlate, onLeavePlate, params);
          if (result === 'break' || result === 'error') break;
        }
        onLeavePlate?.(pieces[0], params);
        if (result === 'break' || result === 'error') break;
      }
    }
    if (result === 'break') return 'break';
    if (result === 'error') return 'error';

    return (onExitPiece)? onExitPiece(this, params):"continue";
  }
  
  messagePlate(onEnterPiece, onExitPiece, onEnterFace, onExitFace, params) {
    
    const status = (onEnterPiece)? onEnterPiece(this, params):"continue";
    if (status === 'break') return 'break';
    if (status === 'error') return 'error'; 
    
    for (const childDiv of this.div.children) {
      if (childDiv._tsiFace === undefined) continue;
    
      let result = null;
      result = childDiv._tsiFace.messageTree(onEnterPiece, onExitPiece, onEnterFace, onExitFace, params);
      
      if (result === 'break') return 'break';
      if (result === 'error') return 'error';
    }
    return (onExitPiece)? onExitPiece(this, params):"continue";
  }
  gotoPlay(frame, keyIndex) {
      // pour toutes les pistes -> track
  }

  /**
   * Saute à la frame N et relance toutes les pistes du plateau.
   * L'horloge est repositionnée, le timer de boucle relancé pour la durée restante.
   */
  gotoPlayGroup(frame) {
    const ptClock = this.ptClock;
    if (!ptClock) return;
    ptClock.gotoPlayGroup(frame);
  }

  /**
   * Saute à la frame N et stoppe toutes les pistes du plateau.
   * Le timer de boucle est annulé sans relance.
   */
  gotoStopGroup(frame) {
    const ptClock = this.ptClock;
    if (!ptClock) return;
    ptClock.gotoStopGroup(frame);
  }
  stopGroup() {
    const ptClock = this.ptClock;
    if (!ptClock) return;
    ptClock.stopGroup();
  }
  //  LE TUYAU VERS LA FACE (PD 06/10) : la Pièce TRANSMET une commande à l'élément pilote de sa
  //  Face courante sans la lire (règle 2) — le curseur, le film. La valeur remonte.
  sendToFace(name, ...params) {
    return this.getFaceCurr()?._tsiFace?.getClockMaster()?.media?.[name]?.(...params);
  }
  /**
   * Retourne la position courante de la Pièce.
   * @param {TsiPiece} piece — doit correspondre à this (vérification d'intégrité)
   */
  getPos(piece) {
    if (piece !== this) { console.error('getPos: wrong piece', piece, this); return null; }
    const s = this.div.style;
    const r = [s.left, s.top];
    if (s.zIndex !== '') r.push(s.zIndex);
    return r;
  }

  //  AU-DESSUS DE SES SŒURS pendant le survol (PD 08/10) : un contrôle réactif à la souris (&button) monte au top de son groupe dès
  //  qu'il quitte OUT, et retrouve sa couche au retour à OUT. Rendu pur — z-index inline, comme la Face sortante en playOut — ni lu ni
  //  exporté. Un contrôle SEUL dans son groupe (la bonne pratique : son sous-groupe de synchro) fait monter le GROUPE : on remonte tant
  //  que le nœud est enfant unique d'un nœud Tispi. TODO (option B-1) : ne pas monter, ou revenir sur d'autres états que OUT.
  raise(up) {
    let div = this.div;
    while (div.parentNode?.children.length === 1 && div.parentNode._tsi) div = div.parentNode;
    const s = div.style;
    if (!up) { if (div._tsiZ !== undefined) { s.zIndex = div._tsiZ; div._tsiZ = undefined; } return; }
    if (div._tsiZ !== undefined) return;                                   // déjà en haut
    div._tsiZ = s.zIndex;
    let max = 0;
    for (const c of div.parentNode.children) { const z = parseInt(getComputedStyle(c).zIndex); if (z > max) max = z; }
    s.zIndex = max + 1;
  }

  /**
   * Écrit la position de la Pièce.
   * @param {TsiPiece} piece — doit correspondre à this (vérification d'intégrité)
   * @param {*} x — valeur avec ou sans unité (convention de la source)
   * @param {*} y
   * @param {*} [z] — zIndex (optionnel)
   */
  setPos(piece, x, y, z) {
    if (piece !== this) { console.error('setPos: wrong piece', piece, this); return; }
    const track = this.timeline.tracks.find(t => t.css?.constructor?.editId === "editPos");
    if (!track) {
      this.div.style.left = x;
      this.div.style.top  = y;
      if (z !== undefined) this.div.style.zIndex = z;
      return;
    }
    const value = z !== undefined ? [x, y, z] : [x, y];
    const frame = this._currentFrame();
    const key   = track.keys.find(k => k.numFrame === frame);
    if (key) track.setValueKey(value, key);
    else     this.createKey("editPos", value);
  }

  /**
   * Retourne les dimensions de la Face ou de la Pièce.
   * @param {TsiPiece} piece — doit correspondre à this (vérification d'intégrité)
   */
  getSize(piece) {
    if (piece !== this) { console.error('getSize: wrong piece', piece, this); return null; }
    const track = this.timeline.tracks.find(t => t.css?.constructor?.editId === "editSize");
    if (track) {
      return [this.div.style.width, this.div.style.height];
    }
    const face = this.getFaceCurr();
    return face ? [face.style.width, face.style.height] : null;
  }

  // (l'ancien setSize(piece, w, h) d'époque éditeur — aucun appelant — est
  //  remplacé par l'API setSize(lg, ht, numFrame) du pipe géométrique, plus haut.)

  /**
   * Retourne la frame courante de l'horloge du plateau.
   */
  _currentFrame() {
    return TsiTrackClock.getFrameNum(this.ptClock);
  }

  /**
   * Crée une key à la frame courante sur la piste identifiée par editId.
   * La valeur est normalisée par KeyClass.createValueKey().
   * Applique le CSS immédiatement.
   */
  createKey(editId, value) {
    const track = this.timeline.tracks.find(t => t.css?.constructor?.editId === editId);
    if (!track) return null;
    const frame    = this._currentFrame();
    const KeyClass = track.css.constructor.key;
    const key      = new KeyClass(frame, KeyClass.createValueKey(value));
    const idx      = track.keys.findIndex(k => k.numFrame > frame);
    if (idx === -1) track.keys.push(key);
    else            track.keys.splice(idx, 0, key);
    track.css.setCss(key.value, track);
    return key;
  }
}
//    ###########      #####         #########      ########### 
//    ####            ########      ####    ####    ####       
//    ####           ####  ####     ####            ####       
//    #########      ####  ####     ####            ########   
//    ####          ############    ####            ####       
//    ####          ####    ####    ####    ####    ####       
//    ####          ####    ####     #########      ###########
//    
// ═════════════════════════════════════════════════════════════
//  FACE
// ═════════════════════════════════════════════════════════════
class TsiFace extends TsiNode{
  static idUnic = 0;
  constructor(div) {
    super(div);
    if(div._tsi==null)  div._tsi= this;
    div._tsiFace = this;
    this.tag = 'tsi-f';                 // tag CANONIQUE (TsiGroup surcharge en 'tsi-g')
    //  (vars, attrs, editor, module, funcDeclar : posés par TsiNode — une Face se
    //   construit « le plus possible comme une Pièce » (PD 19/08), et le service des
    //   attributs lit `node.attrs | node.editor.attrs` en aveugle. resolveVar voit
    //   les Faces : une Face pure se pose en div._tsi ci-dessus — la Pièce prime
    //   sur un nœud fusionné puisqu'elle s'inscrit la première.)
    this.clockMaster = null;          // cache de lookup : la PISTE média responsable (son service naît au premier esclave, S-1)
    this.div.style.position = 'absolute';
    this.div.style.display = 'none';

    this.clockTempo = null;
  }

  // ── DEBUILD : le CONTENU du data-tsi d'une FACE — header (attrs + vars ; pas
  //  de transit, pas de Decl — checkHeaderVar), puis les pistes RE-FUSIONNÉES.
  //  Le build a SPLITTÉ chaque piste sur le token `out` (IN → timeline, OUT →
  //  jumelle de MÊME PROP dans timelineOut, frames relatives à 0, config commune
  //  portée par l'IN) ; la ré-émission fait l'INVERSE :
  //     `&prop config keysIN out keysOUT`     — les deux zones
  //     `&prop config out keysOUT`            — piste OUT-seule
  //  Une piste-macro recollée (`$m;`) COUVRE sa zone out : la ré-incrustation la
  //  régénérera — sa jumelle n'est pas OUT-seule puisque l'IN existe au modèle.
  debuildDataTsi(ctx) {
    this.debuildHeader(ctx);
    this.debuildTracks(this.timeline?.tracks ?? [], ctx);
    //  Les OUT-SEULES : aucune piste IN de même prop au modèle — dérivé, pas d'état.
    const ins = this.timeline?.tracks ?? [];
    for (const o of this.timelineOut?.tracks ?? []) {
      if (o._synth) continue;
      if (ins.some(t => !t._synth && t.out === o)) continue;   // sa section IN l'a déjà émise (LIEN PORTÉ)
      ctx.dt += '&' + o.prop; o.debuildConfig(ctx); ctx.dt += ';';   // la tête, puis `;` : la section d'entrée est vide
      if (o.hideEffect) ctx.dt += ' !' + o.hideEffect.debuild();
      o.debuildKeys(ctx); ctx.dt += ' ';
    }
    ctx.dt += '&';                                           // borne de séquence
  }

  //  SURCHARGE du crochet par-piste (TsiNode) : derrière `!<disparition>` de la piste IN (émis par
  //  track.debuild), la section de sortie de sa jumelle — frames déjà relatives à 0 (étape F-1).
  debuildTrack(t, ctx) {
    t.debuild(ctx);
    if (t.out) t.out.debuildKeys(ctx);                         // LIEN PORTÉ (ex-recherche par prop)
  }
  getClockMaster() {
    if (this.clockMaster) return this.clockMaster;
    // Le maître vit dans la PISTE responsable (ex. &videoSynchro) : elle porte le média ; son service
    // naît au premier esclave, dans attachToMaster — comme une Pièce maître (S-1, PD 11/10).
    for (const track of this.timeline?.tracks ?? [])
      if (track.css?.media)
        return this.clockMaster = track.css;
    return null;
  }
  getPieces() {
    return null;
  }

  //  Le walk des PIÈCES, reçu par une FACE : la face n'est pas une Pièce — pas de
  //  onEnterPiece(this) — elle DÉLÈGUE à son plateau. Couvre le groupe RACINE
  //  (resize, tispiLayout l.124) et le groupe IMBRIQUÉ (la boucle de TsiPiece
  //  l.543 envoie ce message à tout ce que getPieces retourne, groupes compris).
  //  Face nue : getPieces() rend null → 'continue', la feuille du walk.
  messagePieceTree(onEnterPiece, onExitPiece, onEnterPlate, onLeavePlate, params) {
    const pieces = this.getPieces();
    if (!pieces || !pieces.length) return 'continue';
    onEnterPlate?.(pieces[0], params);
    let result = 'continue';
    for (const piece of pieces) {
      result = piece.messagePieceTree(onEnterPiece, onExitPiece, onEnterPlate, onLeavePlate, params);
      if (result === 'break' || result === 'error') break;
    }
    onLeavePlate?.(pieces[0], params);
    return result;
  }

  //  FEUILLE : la face REÇOIT le message, et c'est tout — elle ne descend pas, la
  //  cargaison reste opaque (règle n°1). Elle était MUETTE avant le 2026-08-20
  //  (`return "continue"` sec) : ses attributs n'étaient JAMAIS initialisés au
  //  démarrage — prepareFace (tispiBuild.js:97) fait `TsiAttr.initAll(face, ctx)`
  //  AVANT sa garde `instanceof TsiGroup`, son commentaire promet « TOUTES les
  //  faces », mais le message n'arrivait pas jusqu'ici. Même protocole enter/exit
  //  que TsiGroup : prepareFace pousse sur la pile d'horloges, faceQuit dépile —
  //  l'aller-retour doit rester apparié.
  messagePlate(onEnterPiece, onExitPiece, onEnterFace, onExitFace, params) {
      const status = onEnterFace ? onEnterFace(this, params) : "continue";
      if (status === 'break' || status === 'error') return status;
      return onExitFace ? onExitFace(this, params) : "continue";
  }
  // Face — UN SEUL niveau, par la règle fondamentale : une Face est TOUJOURS l'enfant
  // DOM direct de sa Pièce ; sinon le document n'est pas du format Tispi. D'où l'absence
  // de repli, contrairement à TsiPiece.getPieceParent() qui peut traverser un conteneur.
  getPieceParent() {
    const d = this.div.parentNode;
    return d?._tsi?.isPiece ? d._tsi : null;
  }
}
class TsiFaceDom extends TsiFace{
  /**
   * @param {Element} div
   * @param {Array}   [a] — [-3, <transition>] ou pistes d'apparition — syntaxe TsiPiece
   * @param {Array|boolean} [b] — pistes d'apparition (si a = transition),
   *                              pistes de disparition, ou bouclage
   * @param {Array|boolean} [c] — pistes de disparition, ou bouclage
   * @param {boolean} [d] — bouclage (forme complète)
   *
   * ─────────────────────────────────────────────────────────────────
   *  PLATEAU-DE-FACE  (pistes locales)
   * ─────────────────────────────────────────────────────────────────
   *  Une face peut porter ses propres pistes. Elles forment un plateau
   *  autonome dont la div de plateau est la face elle-même (getPlateDiv).
   *
   *  - Temps local : démarre à 0 à chaque APPARITION de la face (swap),
   *    via onShow() → gotoPlayGroup(0).
   *  - Durée de vie : la disparition fige le plateau, via onHide().
   *  - Bouclage : NON par défaut (effet d'apparition) — l'horloge locale
   *    est créée avec une key stop en fin de pistes. bouclage=true → boucle.
   *  - Priorité Pièce > Face : une piste de face est retirée si la Pièce
   *    maître pilote déjà la même prop SUR LA FACE (props TsiCssFTarget).
   *    Les props à cibles distinctes (ex. pos) coexistent.
   *  - Disparition : le token "out" dans une piste sépare la section
   *    apparition de la section sortie — une piste déclare l'ensemble de
   *    la vie de la propriété, décomposée en interne en deux animations.
   *    Les frames de sortie repartent à 0. Section out sans key 0 :
   *    démarre de la valeur courante (héritage ""). Au swap sortant, les
   *    sections out sont jouées one-shot et le display:none est repoussé
   *    à leur fin (onHide → playOut). Pendant cette fenêtre, la face
   *    sortante passe DERRIÈRE (z-index:-1) — la nouvelle entre devant.
   *
   *  Exemples :
   *    new TsiFace(o_.div())                            — face simple (classe de base)
   *    new TsiFaceDom(o_.div(), [pistes])               — effet d'apparition
   *    new TsiFaceDom(o_.div(), [pistes], true)         — pistes bouclées
   *    new TsiFaceDom(o_.div(), [-3,[30]], [pistes])    — avec transition de face
   *    new TsiFaceDom(o_.div(), [
   *      ["bgColor", 0,"red", 60,"blue", 120, "out", 50,"white"],  — vie complète
   *      ["opacity", "out", 0,"", 20,"0", 20]           — sortie seule
   *    ], true)
   */
  constructor(div) {
    super(div);
    this.timeline    = null;
    this.timelineOut = null;
  }
  /**
   * PIPE sizeChanged — le nerf GÉOMÉTRIQUE de la face : `&size` (ou l'édition)
   * annonce une taille, la face DISPATCHE à ses pistes sans présumer lesquelles
   * sont concernées ; chacune sait LOCALEMENT quoi faire du message (pas
   * d'autorité) et peut répondre l'instruction à appliquer. Points de tir :
   * écritures DISCRÈTES + interruptions volontaires (jamais frame-à-frame —
   * pendant un tween, WAAPI écrit seul ; réagir = interrompre → reconstruire →
   * réarmer à la frame courante). Même famille que le dispatch setInactive.
   * @param {*} value — la taille annoncée ([w,h] réels, ou sentinelle [-1,-1] = « demande »)
   * @returns {*} la première instruction reçue, ou null
   */
  sizeChanged(value) {
    for (const track of [...(this.timeline?.tracks ?? [])]) {   // copie : un récepteur peut se supprimer
      const r = track.css?.onSizeChanged?.(value);
      if (r != null) return r;
    }
    // Demande [-1,-1] sans répondeur-piste : le RENDU répond — la face vit déjà
    // à sa taille (mode intrinsèque CSS ou déclaré), son rect EST la réponse.
    if (Array.isArray(value) && value[0] === -1 && value[1] === -1) {
      const r = this.div.getBoundingClientRect();
      return [Math.ceil(r.width), Math.ceil(r.height)];
    }
    return null;
  }
  //  (_splitPairs SUPPRIMÉE 2026-08-15 — la coupe in/out de la TABLE PLATE,
  //   remplacée par TsiFaceBuilder (bascule buildOut au fil de la lecture,
  //   tispiBuild.js) ; aucun appelant. Avec elle est parti le dernier usage de
  //   TsiTransition.parse.)

  /**
   * Le plateau d'une face à pistes = la face elle-même — donc AUCUNE SYNCHRO,
   * donc AUCUNE HORLOGE. TRANCHÉ DEPUIS L'ORIGINE (PD) : les pistes de face ne
   * respectent aucune synchro — l'animate est lancé à l'APPARITION (onShow →
   * playTrack) et tourne à SON rythme. C'est voulu : une face ne fait que des
   * animations TRÈS COURTES, d'apparition ou de disparition.
   * (L'horloge est toujours une piste de PIÈCE du plateau — cf. prepareFace.)
   */
  getPlateDiv() {return this.div;}

  /** Cible des pistes FTarget du plateau-de-face : la face */
  getFaceCurr() {return this.div;}

  /**
   * Keys à valeur vide ("" ou null) : héritent de la valeur CSS courante de
   * la face précédente (ou de la face elle-même en première apparition).
   * La valeur capturée devient la valeur originelle de CETTE apparition —
   * recapturée au swap suivant. onHide() ayant déjà figé la face sortante,
   * la capture lit exactement sa valeur gelée.
   * Limité aux props ciblant la face (jsProp — TsiCssFTarget).
   */
  inheritValues(prevFace, timeline = this.timeline) {
    const source = prevFace ?? this.div;
    for (const track of timeline.tracks) {
      const jsProp = track.css?.constructor?.jsProp;
      if (!jsProp) continue;
      let captured;
      for (const key of track.keys) {
        if (!key._inheritPrev) continue;
        if (captured === undefined) captured = getComputedStyle(source)[jsProp];
        key.value = captured;
      }
    }
  }

  /**
   * La face est-elle dimensionnée par une piste `&size` ? `&size` est FTarget
   * (vise la face courante) : elle peut vivre sur la face OU sur la Pièce maître
   * (et la règle Priorité Pièce>Face a pu retirer celle de la face).
   */
  /**
   * AUTO-INSPECTION (l'unique lieu — chaque question posée UNE fois, à l'origine) :
   * synthèse du `&size -1,-1` de face = le MODE autoSize. Deux questions :
   *   1. suis-je un CONTENEUR de Pièces ? (mon textContent inclurait la descendance —
   *      le bug historique root/mid ; la taille intrinsèque d'un groupe = bounds, autre chantier)
   *   2. une taille est-elle DÉCLARÉE pour moi ? (ma piste non-synthétique, ou celle
   *      de ma Pièce maître — nœud FUSIONNÉ pf/pg : même div, _tsi = la Pièce)
   * Ni l'une ni l'autre → `&size 0:[-1,-1]` (_synth) : piste ORDINAIRE, dont la
   * commande d'affectation inscrit le mode intrinsèque CSS (max-content) — le
   * RENDU fait vivre l'adaptation, personne ne relit. Pas de test « ai-je du
   * texte » : max-content mesure texte, image, mixte et vide (0) nativement.
   * Une déclaration apparue plus tard → la synthèse devenue caduque est PURGÉE ici.
   */
  ensureSizeTrack() {
    const own   = this.timeline?.getTrack('size');
    const piece = (this.div._tsi !== this) ? this.div._tsi : this.div.parentNode?._tsi;
    // QUESTION UNIQUE, par FAMILLE : la famille DIMENSION est-elle déjà couverte par une VRAIE piste
    // (ici ou sur la Pièce maître) ? Via domainNames — plus d'énumération de noms (&size/posBar/framing…).
    // Toute piste qui déclare 'dimension' (size, posBar, framing, cssAnchor, futurs) tombe dedans d'office.
    const coversDim = tl => tl?.tracks?.some(t => !t._synth && t.css?.constructor?.domainNames?.includes('dimension'));
    if (coversDim(this.timeline) || coversDim(piece?.timeline)) {
      if (own?._synth) {                                   // une vraie piste dimension est apparue → synthèse caduque → purge
        own.css?._anim?.cancel();
        this.timeline.tracks.splice(this.timeline.tracks.indexOf(own), 1);
      }
      return;
    }
    if (own) return;                                       // synthèse déjà posée
    if ([...this.div.children].some(c => c._tsi)) return;  // conteneur de Pièces (bounds = autre concern)
    if (!this.timeline) this.timeline = new TsiTimeline(this);
    const track = new o_.css.size.track('size', this);   // défaut intrinsèque max-content (réifié)
    track.buildTrack(['size', 0, new TsiValConst([-1, -1])]);
    this.animDuration = 1;
    track._synth = true;                                   // exclue de l'export, re-générée au build
    this.timeline.setTrack(track);                         // pose gardée (anti-doublon)
  }

  /** Apparition (swap) : le temps local repart à 0.
   *  @param {Element|null} [prevFace] — source des keys héritées */
  /** Apparition (playIn) — effet local AUTONOME, sans horloge : (re)joue les
   *  animates IN one-shot (ou bouclés si this.loop). fill:'forwards' tient la fin.
   *  Déclenchement = ici ; arrêt = onHide (pause des animates). */
  setActivePlate(prevFace) {
    this._cancelOut();              // réapparition pendant la fenêtre de disparition
    this.div.style.display = 'block';   // symétrique de onHide(false) — utile hors du chemin setCss
    this.ensureSizeTrack();        // auto-inspection : synthèse du &size -1,-1 (mode intrinsèque) si rien de déclaré
    // Liaison LOCALE clockFace : la Pièce hôte (parent) peut être esclave de
    // l'horloge de CETTE face (face vidéo). faceCurr est posé par setCss AVANT
    // → resolveAndAttach résout le maître à la demande (appelle face.getClockMaster).
    this.div.parentNode?._tsi?.ptClock?.clockSlave?.resolveAndAttach();
    if (!this.timeline) return;
    this.inheritValues(prevFace);
    // MISE EN ACTIVITÉ ou bascule de vie courante ? Le flag transitoire de
    // l'horloge hôte (posé pendant le balayage synchrone d'activation) le dit —
    // consommé par le code-intervention des transitions (0 sauf apparition, etc.).
    const appearing = this.div.parentNode?._tsi?.ptClock?._activating === true;
    for (const track of this.timeline.tracks) {
      const css = track.css;
      if (!css?.playTrack) {                                  // piste NON-animée (ex. &size reparenté = dimension inline) :
        const k = track.gotoInfo?.(0)?.key;                  // pas d'animate → poser la valeur de la key courante en direct
        if (css?.setCss && k) css.setCss(k.value, track);
        continue;
      }
      // Fondu d'apparition (goto de key0, unifié) — départ = ÉTAT EN COURS À L'ÉCRAN :
      // la piste homonyme de la face SORTANTE (bascule), sinon lecture locale.
      // Capté AVANT la construction du main (dont le fill snapperait déjà key0) ;
      // l'overlay naît APRÈS le main (l'ordre de création WAAPI donne la priorité).
      if (o_.singleAnim && css instanceof TsiCssAnimated) {
        const from = prevFace?._tsiFace?.timeline?.getTrack(track.prop)?.css?.getCss?.()
                  ?? css.getCss?.();
        if (track.keys.some(k => k.value instanceof TsiJs)) { css._anim?.cancel(); css._anim = null; }   // valeur-script `{…}` : recalculée à CHAQUE apparition (M-1, PD 12/10)
        if (!css._anim) css.buildTrackAnimation(track.keys, this.animDuration, this.loop, track.defaultInterpolation(), track.defaultEffect());
        if (css._anim && track._armGoto(0, true, from, appearing)) continue;   // overlay gouverne (seize) ; release → main
      }
      css.playTrack(track.keys, this.animDuration, this.loop, track.defaultInterpolation?.(), track.defaultEffect?.());   // animate IN autonome
    }
  }
  /**
   * Disparition : fige le plateau d'apparition, puis selon outEnabled :
   *
   * @param {boolean} [outEnabled=true]
   *   true  — disparition NATURELLE (piste face de la timeline) : la
   *           section out est jouée, le display:none est repoussé à sa
   *           fin (voir TsiCssFace.setCss).
   *   false — extinction de CONTENEUR (groupe caché) : aucune transition,
   *           sortie en cours annulée, masquage immédiat.
   */
  onHide(outEnabled = true) {
    // arrêt de playIn : figer les animates IN (pause) → valeur stable pour l'héritage OUT
    if (this.timeline)
      for (const track of this.timeline.tracks) track.css?._anim?.pause();

    if (outEnabled && this.timelineOut) { this.playOut(); return; }

    // extinction sans transition
    if (this.timelineOut) this._cancelOut();
    if (!outEnabled) this.div.style.display = 'none';
  }

  /**
   * Joue les pistes de disparition puis masque la face.
   * One-shot — ni bouclage ni seek : pilotage direct des pistes,
   * sans gotoPlayGroup/messageAllTracks.
   * Keys vides : héritent de la valeur courante de la face (le plateau
   * d'apparition vient d'être figé par onHide → valeurs gelées exactes).
   */
  playOut() {
    this._cancelOut();
    // Face sortante derrière : la nouvelle face entre DEVANT pendant la fenêtre
    this.div.style.zIndex = '-1';
    this.inheritValues(null, this.timelineOut);   // keys vides → valeur courante (figée par onHide)
    for (const track of this.timelineOut.tracks) {
      const from = track.css?.getCss?.();                  // la valeur COURANTE, lue par la piste elle-même (figée par onHide) — étape F-2
      track.css?.playTrack?.(track.hideKeys(from), this.durOut, false, track.defaultInterpolation?.());   // animate OUT autonome, one-shot
      // single-animate : la SORTIE est une prise en main (seize) de la propriété
      // sur la piste IN — l'animate OUT en devient le gouverneur, le main IN est
      // suspendu en 'cancel' (terminal). Retour au main au re-show (onShow → playTrack).
      if (o_.singleAnim) {
        const inTrack = this._matchInTrack(track);
        if (inTrack && track.css._anim)
          inTrack.clutch.seize(track.css._anim, { suspend: 'cancel', returnOn: 'never' });
      }
    }
    this._outTimer = setTimeout(() => {
      this._outTimer = null;
      this.div.style.display = 'none';
      this._clearOutTracks();
    }, Tsi_.frameToMs(this.durOut));
  }

  /**
   * Coupe les timers ET les animations WAAPI résiduelles des pistes out.
   * Indispensable : avec fill:'forwards', une anim out restée active
   * écraserait les écritures des pistes d'apparition au retour de la face
   * (et freeze()/inheritValues capteraient sa valeur — noir propagé).
   */
  _clearOutTracks() {
    this.div.style.zIndex = '';     // restaure le z-order normal
    for (const track of this.timelineOut.tracks) {
      if (track.css._anim) { track.css._anim.cancel(); track.css._anim = null; }   // arrêt de l'animate OUT
      if (track.css._pending !== undefined) track.css._pending = null;
      // Effacer la trace inline (key finale posée par exec) : la face
      // retrouve ses valeurs CSS de base — sinon une prop que les pistes
      // d'apparition ne pilotent pas resterait marquée (ex. opacity 0).
      const jsProp = track.css.constructor.jsProp;
      if (jsProp) this.div.style[jsProp] = '';
    }
  }

  /**
   * Piste IN (apparition) qui pilote la MÊME propriété que `outTrack` — cible de
   * la prise en main (seize) lors de la sortie. Pur : ne touche aucun animate.
   * @returns {TsiTrack|null}
   */
  _matchInTrack(outTrack) {
    if (!(outTrack.css instanceof TsiCssAnimated) || !this.timeline) return null;
    //  Recherche par IDENTITÉ (PD 2026-08-20) : la piste IN est celle qui PORTE
    //  cette sortie. Cherchait auparavant par `css.constructor.jsProp`, donc
    //  pouvait rendre une piste d'une AUTRE propriété écrivant le même jsProp —
    //  et rien ne garantissait l'unicité du résultat. Une piste OUT-seule (aucune
    //  section IN au modèle) n'est portée par personne : null, comme avant.
    return this.timeline.tracks.find(t => t.out === outTrack) || null;
  }

  /** Annule une disparition en cours (réapparition pendant la fenêtre out) */
  _cancelOut() {
    if (!this._outTimer) return;
    clearTimeout(this._outTimer);
    this._outTimer = null;
    this._clearOutTracks();
  }
}











function tsiTag(tag, build) {
  if (customElements.get(tag)) return;                  // garde anti-double-define
  customElements.define(tag, class extends HTMLElement {
    connectedCallback() {
      if (this._tsi) return;                            // garde anti-double-construction
      this._tsiSrcStyle = this.getAttribute('style');   // PROVENANCE : style SOURCE, capturé avant toute écriture runtime (export)
      build(this);                                      // constructeur PAR FORCE ; c'est TsiBuilder qui SAUTE les data-module (tispiBuild.js:150)
      // ⚠ MODULE — BRANCHEMENT 1/4 vers tispiModules.js, NEUTRALISÉ le 2026-08-09
      //   en vue de sa suppression. L'hôte `data-module` se présentait ici à la
      //   file d'expansion (o_._pendingModules), vidée en tête de start().
      //   À REPRENDRE : c'est le point d'entrée du format compressé.
      if (this.dataset.module)
        TsiError.warning(`MODULE SUPPRIMÉ — #${this.id} porte data-module="${this.dataset.module}" : `
          + `l'expansion est débranchée (tispiPiece.js, branchement 1/4). L'hôte reste statique.`);
    }
  });
}
// ═════════════════════════════════════════════════════════════
//  PIÈCE-FACE / PIÈCE-GROUPE  —  nœuds fusionnés
// ═════════════════════════════════════════════════════════════
//
//  La règle d'alternance Pièce ↔ Face est fusionnée en UN nœud : la Pièce
//  EST sa propre face. Adressable comme une Pièce (registre, idUnic, horloge
//  de pièce) ; sert de cible visuelle aux pistes FTarget (&bgColor, &size,
//  &opacity, &color) via getFaceCurr() = son propre div.
//
//  HORLOGES — inchangées. Une horloge ne pilote QUE des Pièces ; la face ne
//  porte jamais d'horloge. Ces nœuds ne déclenchent donc PAS le chemin
//  d'horloge-de-face (onEnterFace → prepareFace) : ils
//  héritent TsiPiece.messagePlate (onEnterPiece seul). Leurs enfants prennent
//  l'horloge ambiante du plateau → transparent à l'horloge (contrairement à
//  tsi-g, une Face, qui crée un sous-plateau).
//
//  tsi-pf : feuille  (pas d'enfant — une Pièce qui est sa propre face)
//  tsi-pg : branche  (héberge des Pièces enfants, comme un groupe)

/** Pièce-Face (tsi-pf) — feuille. */
class TsiPieceFace extends TsiPiece {
  constructor(div) {
    super(div);
    this.faceCurr = this.div;
    this.face = null;
  }
  getPieces() {
    const pieces = [];
    for (const childDiv of this.div.children)
      if (childDiv._tsi) pieces.push(childDiv._tsi);
    return pieces;
  }
  // Le nœud EST sa propre face (this.face interne) → piste face INTERNE en phase A,
  // au lieu de chercher une face ENFANT comme TsiPiece.ensureFaceTrack.
  ensureFaceTrack() {
    if (!this.timeline) return;          // pièce jamais construite (data-tsi absent ou en erreur) : statique, pas un crash
    if (this.timeline.getTrack('face') || this.timeline.getTrack('faceInner')) return;
    const track = new o_.css.faceInner.track('faceInner', this);
    track.buildTrack(['faceInner', 0, 1]);   // 1 = sentinelle (le setCss inner l'ignore)
    track._synth = true;             // synthétisée → exclue de l'export (re-générée au build)
    this.timeline.tracks.unshift(track);
  }

  messagePlate(onEnterPiece, onExitPiece, onEnterFace, onExitFace, params) {
    const status = onEnterPiece ? onEnterPiece(this, params) : "continue";
    if (status === "break" || status === "error") return status;
    const result = this.face.messageTree(
      onEnterPiece, onExitPiece, onEnterFace, onExitFace, params
    );
    if (result === "break" || result === "error") return result;
    return onExitPiece ? onExitPiece(this, params) : "continue";
  }
  
}
class TsiPieceFaceDom extends TsiPieceFace {
  constructor(div) {
    super(div);
    this.tag  = 'tsi-pf';               // tag CANONIQUE
    this.face = new TsiFaceDom(div);
    this.div.style.display = "block";
  }
}

class TsiPieceGroup extends TsiPieceFace {
  constructor(div) {
    super(div);
    this.tag  = 'tsi-pg';               // tag CANONIQUE
    this.face = new TsiGroup(div);
    this.div.style.display = "block";
  }
}
tsiTag('tsi-p',  el => { const piece = new TsiPiece(el);        new TsiPieceBuilder(piece); });
tsiTag('tsi-morph', el => { const piece = new TsiPiece(el);      new TsiPieceBuilder(piece); });  // la succession (&face, 2+ faces)
tsiTag('tsi-pilot', el => { const piece = new TsiPiece(el);      new TsiPieceBuilder(piece); });  // la paire délibérée SANS succession (face à services, temps propre, racine)
tsiTag('tsi-f',  el => { const face = new TsiFaceDom(el);      new TsiFaceBuilder(face); });
tsiTag('tsi-pf', el => { const pieceFace = new TsiPieceFaceDom(el); new TsiPieceFaceBuilder(pieceFace); });
tsiTag('tsi-pg', el => { const pieceGroup = new TsiPieceGroup(el);   new TsiPieceGroupBuilder(pieceGroup); });
tsiTag('tsi-g',  el => { const group = new TsiGroup(el); new TsiGroupBuilder(group);});

// ═════════════════════════════════════════════════════════════
//  LA NOTATION À NOMS PLEINS — quatre tags, un maître chacun (PD 2026-08-31)
// ═════════════════════════════════════════════════════════════
//  Préfixe POSSÉDÉ (tsi- : zéro collision de registre) + noms pleins (ancrage
//  sémantique — un mot se tire par le sens, une lettre est arbitraire). Les
//  préfixes div-* sont SUPPRIMÉS (31/08, aucun fichier en production).
//
//      tsi-morph   la succession — &face, 2+ faces      →  TsiPiece (classique)
//      tsi-pilot   la paire délibérée sans succession   →  TsiPiece (classique)
//                  (face à services, temps propre, racine de branche)
//      tsi-group   racine, ou parent = Pièce classique  →  TsiGroup
//                  position de Pièce                    →  TsiPieceGroup (fusion)
//      tsi-leaf    parent = Pièce classique             →  TsiFaceDom    (cargaison)
//                  position de Pièce                    →  TsiPieceFaceDom (fusion)
//
//  BIJECTION vérifiable : &face ⟺ tsi-morph. La branche «div-g + &face» du vieux
//  décodeur a disparu avec elle (le morphe s'écrit tsi-morph, point). Le TODO
//  tokenizer-avant-aiguillage (PD 26/08) reste pertinent pour le futur validateur
//  (compter les faces), plus pour l'aiguillage.
//
//  SÛRE AU PARSE, parce qu'elle regarde vers le HAUT : le parent est construit
//  AVANT l'enfant (ordre du parseur), et le data-tsi est un attribut — lu avant le
//  callback. Rien ne dépend des enfants, qui n'existent pas encore au jeton.
//
//  ⚠ LA RÈGLE DE LA NOTATION, pour `div-g` SEUL : qui veut la CLASSIQUE écrit sa
//  «&face» — l'implicite du ensureFaceTrack (posé au start) ne se voit pas au
//  parse. Frontière de mot : «&faceInner» ou toute piste «&face…» future ne fait
//  pas une classique.
//
//  « Pièce classique » = TsiPiece qui n'est PAS une fusion — les fusions héritent
//  de TsiPiece (TsiPieceGroup extends TsiPieceFace extends TsiPiece), un seul
//  instanceof les écarte toutes.
const tsiParentClassique = el => {
  const p = el.parentNode?._tsi;
  return p instanceof TsiPiece && !(p instanceof TsiPieceFace);
};

tsiTag('tsi-group', el => {
  if (!tsiParentClassique(el) && el.parentNode?._tsiFace)            // position de PIÈCE
       { const pieceGroup = new TsiPieceGroup(el); new TsiPieceGroupBuilder(pieceGroup); }
  else { const group = new TsiGroup(el);           new TsiGroupBuilder(group); }   // racine, ou face d'une classique
});

tsiTag('tsi-leaf', el => {
  if (tsiParentClassique(el))
       { const face = new TsiFaceDom(el);            new TsiFaceBuilder(face); }     // cargaison
  else { const pieceFace = new TsiPieceFaceDom(el);  new TsiPieceFaceBuilder(pieceFace); }
});




// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiTracksCss.js  (1039 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
//  tispiTracksCss.js — LE CATALOGUE DES PROPRIÉTÉS ANIMABLES
// ═════════════════════════════════════════════════════════════════════════════
//
//  Un TRIPLET Track / Key / Css par propriété — size, color, border, opacity,
//  rotat, onClick, button, drag, onTime, videoSynchro, text — chacun clos par
//  son enregistrement `o_.css.<nom> = …`. Les classes génériques dont ils
//  héritent sont dans tispiTrack.js (Track, Key) et tispiCore.js (Css).
//
//  AJOUTER UNE PROPRIÉTÉ : écrire son triplet ici et l'enregistrer en
//  top-level, comme les onze autres. o_ est initialisé dans tispiCore.js,
//  chargé avant : il n'y a plus de zone morte à contourner (c'était le piège
//  de l'ancien tispi001.js, où o_ arrivait au milieu du fichier).
//
//  CHARGEMENT : dernier des quatre. Issu de la découpe de tispi001.js
//  (2026-08-09) — voir aussi tispiTrack.js, tispiCore.js, tispiPiece.js.
// ═════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════
//  TRACK AJOUTEE
// ═════════════════════════════════════════════════════════════

//  (TsiTrackSize SUPPRIMÉE le 2026-08-20 — coquille VIDE : le rôle est déclaré en
//   ATTRIBUT par la classe Css (`static track`), son comportement vit dans le
//   css composé. `static track` pointe désormais sur TsiTrack.)

class TsiKeySize extends TsiKeySpatial {
  constructor(numFrame, value) { super(numFrame, value, "size"); }
}


// DIMENSION = domaine SPATIAL (taxonomie des rôles PD — pas « structurel ») → appliqué
// INLINE, JAMAIS via WAAPI (conception PD :
// taille statique = setCss inline ; taille tweenée = flex/CSS). D'où TsiCssBase (hors
// branche animée), comme posBar — pas TsiCssFTarget qui traîne l'animate WAAPI.
class TsiCssSize extends TsiCssBase {
  static domainNames = ['dimension'];  // FAMILLE : width + height
  static track  = TsiTrack;
  static key    = TsiKeySize;
  static editId = "editSize";
  static arity  = 2;                  // largeur, hauteur
  static varValue(q) { return [`calc(var(${q}-0) * 1px)`, `calc(var(${q}-1) * 1px)`]; }

  static _unit(v) {
    return Number.isFinite(v) ? v + "px" : v;
  }

  constructor(pieceMaster) {
    super(pieceMaster);
    this._value = undefined;          // dernière valeur posée (pour faceReapply)
  }
  getTarget() { return this.pieceMaster.getFaceCurr(); }   // cible = face courante (ex-TsiCssFTarget)

  //  LE MOTEUR MONO-KEYFRAME (PD 2026-08-23) — « changement de dimension =
  //  changement d'animate d'une seule key ». La taille cesse d'être l'EXCEPTION
  //  inline du canal : elle a un animate comme les autres — repointable au swap de
  //  face, même régime — mais SA courbe n'existe pas : une constante, REMPLACÉE à
  //  chaque franchissement. Le re-layout n'a lieu qu'au remplacement, jamais entre
  //  (doctrine « jamais en mouvement » — verrouillée par l'ABSENCE de transit :
  //  getTransition sort à sa première ligne, aucune transition ne se résout).
  //  finish() : une animation à UNE keyframe pausée à 0 montrerait la valeur
  //  SOUS-JACENTE (la keyframe est le « to ») — finie + fill:forwards, elle TIENT.
  setCss(value, _track) {
    if (value?.constructor?.isTsiValue) value = value.get(this.pieceMaster);
    const target = this.getTarget();
    if (!target) return;
    this._anim?.cancel();
    this._anim = target.animate([this.toKeyframe(value)], { duration: 1, fill: 'forwards' });
    this._anim.finish?.();
  }

  toKeyframe(value) {
    this._value = value;                 // l'OBJET (cohérent avec key.value)
    if (value?.constructor?.isTsiValue) value = value.get(this.pieceMaster);
    // -1,-1 = MODE autoSize : COMMANDE D'AFFECTATION du mode intrinsèque CSS —
    // on inscrit max-content/auto dans le style et on n'y revient JAMAIS : le
    // moteur de RENDU fait vivre l'adaptation (contenu changé → re-layout natif).
    // Aucune mesure, aucune relecture (PD : « inutile de venir le relire »).
    const [w, h] = value;
    if (w === -1 && h === -1)
      return { width: 'max-content', height: 'auto' };
    return {
      width:  TsiCssSize._unit(w),
      height: TsiCssSize._unit(h)
    };
  }

  getCss() {
    const target = this.getTarget();
    if (!target) return null;
    const s = getComputedStyle(target);
    return [s.width, s.height];
  }

  // Interpolation par composante (w, h) — tuple
  lerp(a, b, pc) {
    return [ TsiCssBase._lerp1(a[0], b[0], pc),
             TsiCssBase._lerp1(a[1], b[1], pc) ];
  }

  //  Le moteur existe désormais : le swap se réduit au REPOINTAGE, comme chez les
  //  FTarget. Le repli _value ne sert qu'avant le premier setCss (aucun moteur).
  faceReapply(frameNum, prevFace, track) {
    const face = this.pieceMaster.getFaceCurr();
    if (!face) return;
    if (this._anim) this._anim.effect.target = face;
    else if (this._value !== undefined) Object.assign(face.style, this.toKeyframe(this._value));
  }
}


o_.css.size = TsiCssSize;




//  (TsiTrackColor SUPPRIMÉE le 2026-08-20 — coquille VIDE : le rôle est déclaré en
//   ATTRIBUT par la classe Css (`static track`), son comportement vit dans le
//   css composé. `static track` pointe désormais sur TsiTrack.)
class TsiKeyColor extends TsiKeyCss {
  constructor(numFrame, value) {super(numFrame, value, "color");}
}
class TsiCssColor extends TsiCssFTarget {
  static cssProp      = 'color';
  static jsProp       = 'color';
  static defaultValue = 'inherit';
  static track        = TsiTrack;
  static key          = TsiKeyColor;
}

o_.css.color=TsiCssColor;

//  (TsiTrackBorder SUPPRIMÉE le 2026-08-20 — coquille VIDE : le rôle est déclaré en
//   ATTRIBUT par la classe Css (`static track`), son comportement vit dans le
//   css composé. `static track` pointe désormais sur TsiTrack.)
class TsiKeyBorder extends TsiKeyCss {
  constructor(numFrame, value) { super(numFrame, value, "border"); }
}
/**
 * &border  style, épaisseur, couleur1, round, couleur2?
 *   style     : style de bordure CSS, identique aux 4 côtés (ridge, solid, groove, dashed…)
 *   épaisseur : largeur — nombre = px, ou valeur unitée
 *   couleur1  : couleur simple (côtés haut + gauche)
 *   round     : rayon des coins — nombre = px ; "50%" possible (sans unité = px)
 *   couleur2  : (optionnel) couleur sombre des côtés droit + bas → effet de relief.
 *               Absente → les 4 côtés prennent couleur1.
 * Cible : la face courante (FTarget), comme &bgColor / &size.
 */
class TsiCssBorder extends TsiCssFTarget {
  static track  = TsiTrack;
  static key    = TsiKeyBorder;
  static editId = "editBorder";
  static arity  = [4, 5];            // style, épaisseur, couleur1, round, [couleur2]

  static _len(v) { return Number.isFinite(v) ? v + 'px' : v; }   // sans unité → px

  toKeyframe(value) {
    this._value = value;          // l'OBJET (cohérent avec key.value)
    if (value?.constructor?.isTsiValue) value = value.get(this.pieceMaster);
    const [style, width, color1, round, color2] = value;
    const c2 = (color2 != null && color2 !== '') ? color2 : color1;   // relief ou uniforme
    return {
      borderStyle:       style,
      borderWidth:       TsiCssBorder._len(width),
      borderRadius:      TsiCssBorder._len(round),
      borderTopColor:    color1,
      borderLeftColor:   color1,
      borderRightColor:  c2,
      borderBottomColor: c2,
    };
  }

  getCss() { return this._value ? this._value.get() : this._value; }   // objet → brut (pour sampling/frozen)

  // Interpolation par élément : épaisseur/round (nombres) interpolés ; style/couleurs → snap.
  lerp(a, b, pc) {
    return a.map((v, i) => TsiCssBase._lerp1(v, b[i], pc));
  }

  faceReapply(frameNum, prevFace, track) {
    const face = this.pieceMaster.getFaceCurr();
    if (!face) return;
    if (this._anim) this._anim.effect.target = face;
    else if (this._value !== undefined) Object.assign(face.style, this.toKeyframe(this._value));
  }
}

o_.css.border = TsiCssBorder;

//  (TsiTrackOpacity SUPPRIMÉE le 2026-08-20 — coquille VIDE : le rôle est déclaré en
//   ATTRIBUT par la classe Css (`static track`), son comportement vit dans le
//   css composé. `static track` pointe désormais sur TsiTrack.)
class TsiKeyOpacity extends TsiKeyCss {
  constructor(numFrame, value) {super(numFrame, value, "opacity");}
}
/** Indispensable aux effets de disparition : finir sur "0" rend la face
 *  réellement invisible (un bgColor final reste un pavé opaque). */
class TsiCssOpacity extends TsiCssFTarget {
  static cssProp      = 'opacity';
  static jsProp       = 'opacity';
  static defaultValue = '1';
  static track        = TsiTrack;
  static key          = TsiKeyOpacity;
}

o_.css.opacity=TsiCssOpacity;

/* TODO à placer dans TsiCssKeySize
toValueEditor(ref) {
  const style            = this.piece.getFaceCurr?.()?.div.style ?? this.piece.div.style;
  const [wValue, wUnit]  = TsiKeyCss.parseCssValue(style.width);
  const [hValue, hUnit]  = TsiKeyCss.parseCssValue(style.height);

  if (wUnit !== '%' && hUnit !== '%')
    return [wValue, hValue, wUnit, hUnit, null, null];

  return [wValue, hValue, wUnit, hUnit,
    wUnit === '%' ? () => wValue * ref.w / 100 : null,
    hUnit === '%' ? () => hValue * ref.h / 100 : null,
  ];
}
*/



// ═══════════════════════════════════════════════════════════════════
// Piste rotat : rotation
// ═══════════════════════════════════════════════════════════════════

//  (TsiTrackRotat SUPPRIMÉE le 2026-08-20 — coquille VIDE : le rôle est déclaré en
//   ATTRIBUT par la classe Css (`static track`), son comportement vit dans le
//   css composé. `static track` pointe désormais sur TsiTrack.)
class TsiKeyRotat extends TsiKeyCss {
  constructor(numFrame, value) { super(numFrame, value, "rotat"); }
}
//  ⚠ TODO — `&scale`, ET LA COMPOSITION DES TRANSFORMS (PD 2026-08-26).
//  `transform` est aujourd'hui possédée par UNE piste : `&rotat` l'écrit en entier.
//  Ajouter `&scale` naïvement la ferait ÉCRASER la rotation — même propriété CSS,
//  deux pistes : le conflit que le moteur interdit partout ailleurs (une piste = UNE
//  propriété). Le commentaire de domReadable ci-dessous le dit déjà : « le transform
//  est mixable (rotate+scale+translate) ».
//  DEUX SORTIES, à trancher :
//   a. `&scale` seule, en convenant que rotat et scale ne coexistent pas — simple,
//      mais c'est une interdiction qui ne se voit pas ;
//   b. AUTOMATISER LES TRANSFORMS : `transform` cesse d'être la propriété d'une piste
//      pour devenir une COMPOSITION — chaque piste contributrice (rotat, scale, et
//      demain translate, skew) pose SA part, le moteur assemble `rotate(…) scale(…)`.
//      C'est la voie juste : elle rend `transform` à sa nature (une liste de gestes)
//      et rouvre `getCss` par composante, que la décomposition matricielle interdit.
//  CLIENT EN ATTENTE : `$playTr(pieceOrg, offX, offY, scaleX, scaleY, rotation)`
//  (tispiFuncs.js) — ses paramètres scaleX/scaleY n'ont aucune piste où aller.
class TsiCssRotat extends TsiCssAnimated {
  static cssProp      = 'transform';
  static jsProp       = 'transform';
  static defaultValue = '0';
  static track        = TsiTrack;
  static key          = TsiKeyRotat;
  static editId       = "editRotat";
  static arity        = [1, 3];       // angle, [axeX, axeY]
  // Pas de getCss : le transform est mixable (rotate+scale+translate) et la
  // décomposition matricielle perd les tours >360°. La valeur courante de la
  // rotation vient du CALCUL MANUEL (TsiTrack.valueAt), au temps courant comme
  // hors-temps. freeze() route en conséquence via domReadable.
  static domReadable  = false;

  // Valeur : angle SEUL  → "180"               (scalaire)
  //          angle + axe → [180,"50%","50%"]   (point/axe de rotation, OPTIONNEL)
  //   ex. data-tsi : &rotat 0:180,50%,50%   (axe = transform-origin)
  // Défaut d'axe '50% 50%' = centre = défaut CSS → un &rotat sans axe est inchangé.
  static _origin(v, dflt) {
    if (v == null) return dflt;
    return (typeof v === 'number') ? v + 'px' : v;   // nombre nu → px ; "%"/keyword tels quels
  }

  // Cible la FACE courante (l'élément VISIBLE et DIMENSIONNÉ), pas la Pièce :
  // la taille vit sur la face (&size), la Pièce-conteneur est souvent 0×0 →
  // un transform-origin en % y dégénérerait (50% de 0 = 0 → rotation au coin).
  // tsi-pf (fusionné) : getFaceCurr() renvoie le div de la Pièce → inchangé.
  getTarget() { return this.pieceMaster.getFaceCurr() ?? this.pieceMaster.div; }

  toKeyframe(value) {
    if (value?.constructor?.isTsiValue) value = value.get(this.pieceMaster);
    const a  = Array.isArray(value) ? value : [value];
    const ox = TsiCssRotat._origin(a[1], '50%');
    const oy = TsiCssRotat._origin(a[2], '50%');
    return { transform: `rotate(${a[0]}deg)`, transformOrigin: `${ox} ${oy}` };
  }

  // valueAt (échantillonnage manuel hors-DOM) interpole par composante :
  // l'angle (numérique) varie ; l'axe (% / keyword) snappe — son animation fluide,
  // rare, reste gérée nativement par la WAAPI (toKeyframe par key → buildKeyframes).
  lerp(a, b, pc) {
    if (!Array.isArray(a) && !Array.isArray(b)) return TsiCssBase._lerp1(a, b, pc);
    const aa = Array.isArray(a) ? a : [a];
    const bb = Array.isArray(b) ? b : [b];
    const n  = Math.max(aa.length, bb.length);
    const out = [];
    for (let i = 0; i < n; i++) out.push(TsiCssBase._lerp1(aa[i] ?? bb[i], bb[i] ?? aa[i], pc));
    return out;
  }
}
o_.css.rotat = TsiCssRotat;

// ═════════════════════════════════════════════════════════════
//  LES ROTATIONS 3D — `&rotX/Y/Z`, `&rotXY/XZ/YZ`, `&rotXYZ` (T-2, PD 08/10 : « une seule piste transform par Pièce ;
//  pour combiner, une piste combinée »). UNE piste = la propriété `transform` ENTIÈRE = UN animate — règle 6 tenue sans
//  composition navigateur (la voie `composite: add` de T-1 est abandonnée : le navigateur retirait une part finie).
//  Valeur : un angle par axe (degrés), dans l'ordre du nom — `&rotXZ 0:90,0; 100:180,270`. Pas de lecture DOM (la
//  matrice perd les tours > 360°) : la valeur courante vient de valueAt, comme &rotat.
class TsiCssRotate extends TsiCssAnimated {
  static cssProp      = 'transform';
  static jsProp       = 'transform';
  static axes         = '';               // X · Y · Z · XY · XZ · YZ · XYZ — chaque héritière le nomme
  static defaultValue = 0;
  static track        = TsiTrack;
  static domReadable  = false;
  getTarget() { return this.pieceMaster.getFaceCurr() ?? this.pieceMaster.div; }
  toKeyframe(value) {
    if (value?.constructor?.isTsiValue) value = value.get(this.pieceMaster);
    const v = Array.isArray(value) ? value : [value];
    return { transform: [...this.constructor.axes].map((ax, i) => `rotate${ax}(${v[i] ?? 0}deg)`).join(' ') };
  }
  lerp(a, b, pc) {                        // par composante, comme &rotat
    if (!Array.isArray(a) && !Array.isArray(b)) return TsiCssBase._lerp1(a, b, pc);
    const aa = Array.isArray(a) ? a : [a], bb = Array.isArray(b) ? b : [b], out = [];
    for (let i = 0; i < Math.max(aa.length, bb.length); i++) out.push(TsiCssBase._lerp1(aa[i] ?? bb[i], bb[i] ?? aa[i], pc));
    return out;
  }
}
class TsiKeyRotX   extends TsiKeyCss { constructor(f, v) { super(f, v, "rotX");   } }
class TsiKeyRotY   extends TsiKeyCss { constructor(f, v) { super(f, v, "rotY");   } }
class TsiKeyRotZ   extends TsiKeyCss { constructor(f, v) { super(f, v, "rotZ");   } }
class TsiKeyRotXY  extends TsiKeyCss { constructor(f, v) { super(f, v, "rotXY");  } }
class TsiKeyRotXZ  extends TsiKeyCss { constructor(f, v) { super(f, v, "rotXZ");  } }
class TsiKeyRotYZ  extends TsiKeyCss { constructor(f, v) { super(f, v, "rotYZ");  } }
class TsiKeyRotXYZ extends TsiKeyCss { constructor(f, v) { super(f, v, "rotXYZ"); } }
class TsiCssRotX   extends TsiCssRotate { static axes = 'X';   static arity = [1, 1]; static key = TsiKeyRotX;   static editId = "editRotX";   }
class TsiCssRotY   extends TsiCssRotate { static axes = 'Y';   static arity = [1, 1]; static key = TsiKeyRotY;   static editId = "editRotY";   }
class TsiCssRotZ   extends TsiCssRotate { static axes = 'Z';   static arity = [1, 1]; static key = TsiKeyRotZ;   static editId = "editRotZ";   }
class TsiCssRotXY  extends TsiCssRotate { static axes = 'XY';  static arity = [2, 2]; static key = TsiKeyRotXY;  static editId = "editRotXY";  }
class TsiCssRotXZ  extends TsiCssRotate { static axes = 'XZ';  static arity = [2, 2]; static key = TsiKeyRotXZ;  static editId = "editRotXZ";  }
class TsiCssRotYZ  extends TsiCssRotate { static axes = 'YZ';  static arity = [2, 2]; static key = TsiKeyRotYZ;  static editId = "editRotYZ";  }
class TsiCssRotXYZ extends TsiCssRotate { static axes = 'XYZ'; static arity = [3, 3]; static key = TsiKeyRotXYZ; static editId = "editRotXYZ"; }
o_.css.rotX = TsiCssRotX;   o_.css.rotY = TsiCssRotY;   o_.css.rotZ = TsiCssRotZ;
o_.css.rotXY = TsiCssRotXY; o_.css.rotXZ = TsiCssRotXZ; o_.css.rotYZ = TsiCssRotYZ; o_.css.rotXYZ = TsiCssRotXYZ;





// ═════════════════════════════════════════════════════════════
//  PISTE onClick — action(s) au clic (process fonctions-Tispi)
//
//  Valeur de key : bloc d'action { nom(params); … } → [TsiFc] | null.
//    • Construction des [TsiFc] au BUILD : IDENTIQUE à onTime.
//    • setCss câble div.onclick → EXÉCUTE les TsiFc (même boucle qu'onTime).
//    • Positionnement/déclenchement : celui, inchangé, de l'ex-onMouse.
//  Sérialisable : chaque TsiFc porte nom + params ; null → handler retiré.
//
//  Usage (DSL)     :  &onClick 0:{ alert(CLIC); log(au clic); };
//  Usage (tableau) :  ["onClick", 0, [ ["alert","CLIC"] ]]
//
//  (onMouseDown/Up/Move/Enter/Leave : même schéma, gardés sous le bras.)
// ═════════════════════════════════════════════════════════════

//  (TsiTrackOnClick SUPPRIMÉE le 2026-08-20 — son ctor n'appelait que super,
//   tout son corps était commenté. NOTE conservée : la conversion string DSL →
//   TsiFc des keys (identique à onTime) se ferait ici si on la réactivait —
//   k.src garde la provenance brute pour l'export, k.value la forme compilée.)

class TsiKeyOnClick extends TsiKeyCss {
  constructor(numFrame, value) { super(numFrame, value, "onClick"); }
}

class TsiCssOnClick extends TsiCssBase {
  static defaultValue = null;
  static track        = TsiTrack;
  static key          = TsiKeyOnClick;
  static trackFormat  = TrackFormat.STATE;   // handler courant = état (re-appliqué)

  constructor(pieceMaster) {
    super(pieceMaster);
    const div = pieceMaster.div;
    this.setCss = (value, _track) => {
      if (value == null) {                            // borne (;) : remonter aux keys précédentes…
        let i = _track.keyIndex;
        while (i >= 0 && _track.keys[i].value == null) i--;
        value = i >= 0 ? _track.keys[i].value : null; // …1ʳᵉ value non-null
      }
      div.onclick = value ? () => {                   // value = TsiJs/Func réifié → handler | null → efface
        // clic = geste utilisateur → BALISE de début de cran d'undo (sync ET atterrissages async rejoignent le cran).
        if (typeof TsiUndo !== 'undefined') TsiUndo.newTransaction('onClick');
        // Le porteur est une Pièce OU une Face : la règle isPiece est appliquée ICI,
        // une fois, et le contexte porte ensuite les deux séparément.
        const face  = pieceMaster.isPiece ? null : pieceMaster;
        const piece = pieceMaster.isPiece ? pieceMaster : pieceMaster.div.parentNode._tsi;
        // La frame est lue AU CLIC, pas au câblage : entre les deux, l'horloge a tourné.
        // Et elle se lit sur la PIÈCE — une Face n'a pas de numéro de frame.
        const numFrame = piece._currentFrame();
        value.get(new TsiCtx(piece, face, _track, numFrame,
                             _track.keys.find(k => k.numFrame === numFrame) ?? null));
      } : null;
    };
  }
}

o_.css.onClick = TsiCssOnClick;

// ═══════════════════════════════════════════════════════════════════
//  PISTE &button — bouton 3 états (wrapper pur : souris → gotoStop)
//
//  À poser sur le GROUPE (tsi-pg) : isolation d'horloge automatique. Les
//  listeners sont sur le div du groupe (zone cliquable, côté DEHORS / temps
//  parent) ; le gotoStop s'adresse à un ENFANT (côté DEDANS / horloge interne)
//  — d'où child().gotoStopGroup, jamais piece.gotoStopGroup.
//    mouseenter → 1 (survolé)   mousedown → 2 (appuyé)   mouseleave → 0 (normal)
//  Aucun init (l'état 0 vient du goto(0) d'entrée, hors horloge groupe), aucune
//  garde : si du spécifique était nécessaire, ce serait un défaut de la transition.
// ═══════════════════════════════════════════════════════════════════
/*class TsiTrackButton extends TsiTrackCss {
  activeKeyAt0() {
    const div = this.piece.div;
    const child = () => [...div.children].map(c => c._tsi).find(Boolean);   // horloge interne
    div.addEventListener('mouseenter', () => child()?.gotoStopGroup(1));    // survolé
    div.addEventListener('mouseleave', () => child()?.gotoStopGroup(0));    // normal
    div.addEventListener('mousedown',  () => child()?.gotoStopGroup(2));    // appuyé
    div.addEventListener('mouseup',    () => child()?.gotoStopGroup(1));
  }
}
*/
//  Le CORPS ACTIF vit dans TsiBuilder.postBuild.button (tispiBuild.js) — retiré
//  d'ici le 2026-08-16. Il était resté APRÈS la copie : les listeners souris
//  étaient posés DEUX fois (mesuré : 8 poses pour 4 types), chaque clic tirant
//  gotoStopGroup deux fois. Le ctor de piste ne pose plus que l'identité — ni
//  keys ni css —, donc un corps actif ne peut plus s'y exécuter ; postBuild est
//  appelé APRÈS les keys et initCss, à l'endroit qui sait la piste complète.
//  (TsiTrackButton SUPPRIMÉE le 2026-08-20 — son unique méthode était un REFUS de
//   message, qui a rejoint SON RÔLE : TsiCssButton.activeKeyAt0, plus bas.)
// ═════════════════════════════════════════════════════════════════
//  &button / $$button — LE VOCABULAIRE DU CONTRÔLE (PD 2026-08-22)
// ═════════════════════════════════════════════════════════════════
//  Une BALISE décrit la SITUATION de la souris, pas une apparence — c'est ce qui
//  rend les cases impossibles lisibles : un `down` depuis OUT ne peut pas naître,
//  la souris est DEHORS de la div.
//
//      &button  frame : BALISE [, pathEffet [, xRel, yRel]] ;
//
//                   enter        leave        down         up
//      OUT          OVER         —            —            —
//      OVER         —            OUT          PUSHED       —
//      PUSHED       —            OUT          —            ▶RELEASED▶ ON_OVER | OVER
//      ON           ON_OVER      —            —            —
//      ON_OVER      —            ON           ON_PUSHED    —
//      ON_PUSHED    —            ON           —            ▶RELEASED▶ OVER
//
//  · la présence de ON fait la BASCULE (pop-up) ; le `up` de PUSHED vise alors
//    ON_OVER — la souris est ENCORE dessus —, OVER sinon.
//  · REPLIS (cible non déclarée → dégradation DANS sa famille) :
//    PUSHED→OVER→OUT · ON_PUSHED→ON_OVER→ON→OUT — le roll-over tient en 2 balises.
//  · RELEASED est TRAVERSÉE : son effet tire, on n'y va jamais — sa frame ne sert
//    qu'à porter la déclaration. L'effet joue sur SON plateau, désynchronisé
//    (pathEffet : le terminal est JOUÉ, le premier pas — la sœur — POSITIONNÉ au
//    centre du bouton + (xRel, yRel)).
//  · le CLIC est HORS bouton (&onClick) : ici, le comportement INTERNE du contrôle.
//
//  LA BALISE RÉIFIÉE — l'état appartient à SA pièce et sait deux choses : entrer
//  chez lui, et où chaque événement l'emmène. Une méthode ABSENTE = un impossible.
class TsiBtState {
  static repli = null;                       // dégradation (nom de balise), null = fin de chaîne
  constructor(piece, frame, action) {
    this.piece  = piece;
    this.frame  = frame;
    this.action = action ?? null;            // TsiValNamed (BALISE :: action) — getValue() tire À LA TRAVERSÉE
    this.nom    = null;                      // posé par buildStates (les messages parlent)
    this.css    = null;                      // posé par buildStates — la table de MON contrôle
  }
  enter()  { this.tirer(); this.piece.gotoStopGroup(this.frame); }

  //  L'ACTION DE LA BALISE (PD 2026-08-27) — LE MOTEUR EST AGNOSTIQUE : il TIRE ce
  //  que la key déclare, il ne décide RIEN. Ce qui vivait ici en dur — rembobiner,
  //  placer la sœur, ignorer un survol répété — était de la PRÉSENTATION : c'est
  //  désormais à l'AUTEUR de l'écrire dans son action, avec le vocabulaire du
  //  langage. getValue() est le déclencheur ; le ctx, celui de la capsule.
  tirer() {
    if (!this.action) return;
    this.action.getValue();
  }
  over() {}  out() {}  down() {}  up() {}    // la base IGNORE tout
}
class TsiBtStateOut extends TsiBtState {
  over() { return 'OVER'; }
}
class TsiBtStateOver extends TsiBtState {
  static repli = 'OUT';
  out()  { return 'OUT'; }
  down() { return 'PUSHED'; }
}
class TsiBtStatePushed extends TsiBtState {
  static repli = 'OVER';
  out() { return 'OUT'; }
  //  ['traversée', cible] — la souris est encore dessus : ON_OVER si la bascule existe.
  up()  { return ['RELEASED', this.css.aBascule() ? 'ON_OVER' : 'OVER']; }
}
class TsiBtStateOn extends TsiBtState {
  static repli = 'OUT';
  over() { return 'ON_OVER'; }
}
class TsiBtStateOnOver extends TsiBtState {
  static repli = 'ON';
  out()  { return 'ON'; }
  down() { return 'ON_PUSHED'; }
}
class TsiBtStateOnPushed extends TsiBtState {
  static repli = 'ON_OVER';
  out() { return 'ON'; }
  up()  { return ['RELEASED', 'OVER']; }
}
//  TRAVERSÉE : l'ACTION seule, jamais de goto — on n'habite pas RELEASED.
class TsiBtStateReleased extends TsiBtState {
  enter() { this.tirer(); }
}

class TsiKeyButton extends TsiKeyCss { constructor(f, v) { super(f, v, "button"); } }
class TsiCssButton extends TsiCssBase {
  static defaultValue = undefined;          // pas de pseudo-key
  static track        = TsiTrack;
  //  REFUS du message : le redémarrage temporel ne doit pas recréer le comportement
  //  souris (posé par TsiBuilder.postBuild.button). Corps de l'ancienne
  //  TsiTrackButton.activeKeyAt0, supprimée le 2026-08-20.
  activeKeyAt0(track) { }
  static key          = TsiKeyButton;
  constructor(pm) { super(pm); this.setCss = () => {}; }   // piste-comportement : aucune sortie CSS

  //  LE REGISTRE — la table EST la liste : une balise est connue si elle a sa
  //  classe. Un huitième mot, un jour, = sa classe + sa ligne ici — comportement,
  //  validation et doc du même geste. Le vocabulaire appartient au RÔLE, pas au
  //  moteur global : un autre contrôle aura le sien.
  static states = { OUT: TsiBtStateOut, OVER: TsiBtStateOver, PUSHED: TsiBtStatePushed,
                    RELEASED: TsiBtStateReleased, ON: TsiBtStateOn,
                    ON_OVER: TsiBtStateOnOver, ON_PUSHED: TsiBtStateOnPushed };

  aBascule() { return 'ON' in this.table; }

  //  ═══ LA MACHINE (étape 2) ═══
  //  L'état courant n'est JAMAIS stocké : il se lit sur la frame où le plateau est
  //  arrêté. Frame sans balise (un tiers a déplacé le plateau) ou plateau en
  //  lecture → la machine raisonne depuis OUT.
  etatCourant() {
    const clock = this.pieceMaster.ptClock;
    const st = (clock?.frameStop != null) ? this.parFrame[clock.frameStop] : null;
    return st ?? this.table.OUT;
  }

  //  Un nom → l'état DÉCLARÉ le plus proche, par la chaîne de repli des classes
  //  (PUSHED→OVER→OUT · ON_PUSHED→ON_OVER→ON→OUT). Null si toute la chaîne manque.
  resoudre(nom) {
    while (nom) {
      const st = this.table[nom];
      if (st) return st;
      nom = TsiCssButton.states[nom].repli;
    }
    return null;
  }

  //  LE CÂBLAGE (étape 4) — écrit ICI et nulle part ailleurs : les deux écritures
  //  du contrôle appellent cette méthode, aucune ne pose ses listeners elle-même.
  //  `_btWired` vit sur la Pièce (même famille que posUnlock : une prise en main
  //  du div) — en double écriture $$button + &button, le second arrivé s'abstient.
  initMouse(piece) {
    if (piece._btWired) return;
    piece._btWired = true;
    const div = piece.div;
    TsiDomListener.add(piece, div, 'mouseenter', () => this.mouseEvent('over'));
    TsiDomListener.add(piece, div, 'mouseleave', () => this.mouseEvent('out'));
    TsiDomListener.add(piece, div, 'mousedown',  () => this.mouseEvent('down'));
    TsiDomListener.add(piece, div, 'mouseup',    () => this.mouseEvent('up'));
  }

  //  Le point d'entrée unique des quatre listeners. L'état courant dit où
  //  l'événement l'emmène (méthode absente = impossible → rien) ; un tableau
  //  ['RELEASED', stable] est une TRAVERSÉE : l'effet de RELEASED tire s'il est
  //  déclaré, puis la cible stable. Repli jusqu'à soi-même → no-op, l'effet de
  //  l'état courant ne re-tire pas.
  mouseEvent(evt) {
    const courant = this.etatCourant();
    let cible = courant[evt]();
    if (cible == null) return;
    if (Array.isArray(cible)) {
      this.resoudre(cible[0])?.enter();      // RELEASED : effet seul (enter surchargé)
      cible = cible[1];
    }
    const st = this.resoudre(cible);
    if (!st || st === courant) return;
    st.enter();
    this.pieceMaster.raise(st !== this.table.OUT);   // hors de OUT : au top du groupe ; retour à OUT : sa couche (B-1, PD 08/10)
  }

  //  LA TABLE DU CONTRÔLE, lue des keys — au postBuild, seul moment où keys et css
  //  sont complets. « Une frame, une balise » est STRUCTUREL (une piste n'a qu'une
  //  key par frame) ; se vérifient ici : le miroir (une balise, une frame), le mot
  //  inconnu, OUT requis. Une valeur NUMÉRIQUE est ignorée (héritage : les keys de
  //  &button n'étaient jamais lues). Table vide → l'implicite 0:OUT; 1:OVER;
  //  2:PUSHED — les pages `&button;` nues gardent leur comportement.
  buildStates(track, piece) {
    this.table = {};
    for (const k of track?.keys ?? []) {     // track null = forme NUE ($$button) → l'implicite
      if (k.numFrame < 0) continue;
      const v     = k.value;
      const cells = (v instanceof TsiValArray) ? v.array : [v];
      //  LA CELLULE 0 : la balise nue (`0:OUT`) OU la VALEUR NOMMÉE
      //  (`3:RELEASED :: {action}`) — get() rend LE NOM dans les deux cas, SANS
      //  RIEN TIRER ; l'action attend dans la nommée (getValue, à la traversée).
      const nomV  = cells[0];
      const nom   = nomV?.get?.();
      if (nom == null || typeof nom === 'number') continue;      // borne nue / valeur morte d'héritage
      const Cls = TsiCssButton.states[nom];
      if (!Cls) TsiError.error(`&button : balise inconnue « ${nom} » — connues : ${Object.keys(TsiCssButton.states).join(', ')}`);
      if (this.table[nom]) TsiError.error(`&button : balise ${nom} déclarée DEUX fois (frames ${this.table[nom].frame} et ${k.numFrame}) — l'événement ne saurait où aller`);
      const st = new Cls(piece, k.numFrame,
        nomV instanceof TsiValNamed ? nomV : null);              // l'action vit DANS la nommée
      st.css = this; st.nom = nom;
      this.table[nom] = st;
    }
    if (Object.keys(this.table).length === 0)
      for (const [nom, frame] of [['OUT', 0], ['OVER', 1], ['PUSHED', 2]]) {
        const st = new TsiCssButton.states[nom](piece, frame, null);
        st.css = this; st.nom = nom;
        this.table[nom] = st;
      }
    else if (!this.table.OUT)
      TsiError.error(`&button : OUT requis dès qu'une table est écrite (la machine raisonne depuis lui)`);
    //  L'index frame → état : l'état COURANT se lit sur la frame arrêtée, jamais
    //  stocké. RELEASED n'y figure pas — on ne s'y arrête jamais.
    this.parFrame = {};
    for (const st of Object.values(this.table))
      if (!(st instanceof TsiBtStateReleased)) this.parFrame[st.frame] = st;
  }
}
o_.css.button = TsiCssButton;


// ═════════════════════════════════════════════════════════════
//  &mark — LES BALISES : des noms posés sur des frames (étape S, 26/09)
// ═════════════════════════════════════════════════════════════
//  Piste-comportement, sur le modèle de &button : aucune sortie CSS, rien au
//  franchissement. Une key porte un NOM nu, comme celles de &face. La piste est DE
//  PIÈCE (PD 17/09) : `$gotoStop("X")` cherche X dans la &mark de la Pièce que son
//  chemin atteint (tispiFuncs.js, frameDe) — deux Pièces d'un même plateau peuvent
//  porter la même balise sans se concurrencer, on n'accède à une piste que par sa Pièce.
//      &mark 0:OUVERTE; 100:FERMEE;      puis      $parent->vanne->$gotoStop("FERMEE")
class TsiKeyMark extends TsiKeyCss { constructor(f, v) { super(f, v, "mark"); } }
class TsiCssMark extends TsiCssBase {
  static defaultValue = undefined;          // pas de pseudo-key à -1
  static track        = TsiTrack;
  static key          = TsiKeyMark;
  activeKeyAt0(track) { }
  constructor(pm) { super(pm); this.setCss = () => {}; }   // piste-comportement : aucune sortie CSS
}
o_.css.mark = TsiCssMark;


// ═════════════════════════════════════════════════════════════
//  TsiDrag — service de déplacement souris (SINGLETON)
//
//  1 souris = 1 seul élément draggé à la fois → état global unique.
//  La piste &drag appelle attach(piece) au mousedown, detach(piece) au mouseup.
//  attach pilote la PIÈCE FILLE (plateau d'états 0/1/2) via gotoStopGroup — comme le bouton :
//    onTime 0 : onDragStart   (attach)
//    onTime 1 : onDrag        (chaque mousemove ; re-tire)
//    onTime 2 : onDragEnd     (detach)
//  Les actions onTime sont déclarées en data-tsi ; elles lisent TsiDrag.delta.
//  Changement de pièce : _release nettoie l'actuel SANS onDragEnd. Lots : delta du leader.
// ═════════════════════════════════════════════════════════════
class TsiDrag {
  static piece = null; static child = null; static origin = null; static delta = null; static x0 = 0; static y0 = 0;

  /** AJOUTE la pièce au drag — appelé au mousedown par la piste &drag. */
  static attach(piece) {
    if (TsiDrag.piece) TsiDrag._release();          // changement de pièce → nettoie l'actuel (sans onDragEnd)
    TsiDrag.piece  = piece;
    TsiDrag.child  =  TsiDrag._cible(piece);        // la Pièce fille (plateau d'états 0/1/2)
    TsiDrag.origin = null;                          // capturée au 1er mousemove
    TsiDrag.x0 = parseFloat(piece.div.style.left) || piece.div.offsetLeft || 0;   // position de départ
    TsiDrag.y0 = parseFloat(piece.div.style.top)  || piece.div.offsetTop  || 0;
    // PRISE EN MAIN de la position (PD 2026-08-16) : sans ceci, l'animate WAAPI de
    // &pos (fill:forwards) RECOUVRE le style inline — le drag écrivait dans le vide.
    // L'ordre compte : 1. figer la position COURANTE dans le style (x0/y0 lus sur le
    // rendu ANIMÉ) — sinon le cancel ferait sauter la Pièce à sa base ; 2. flusher
    // l'animate ; 3. posUnlock ferme les goto de la piste `pos` (gardes en tête de
    // gotoPlay/gotoStop) pour toute la durée du glissé.
    // Un GESTE = un cran d'undo : la balise s'ouvre au mousedown, l'atome du
    // relâchement la rejoint. Sans elle, tous les drags tomberaient dans le même
    // cran et un seul undo les défferait ensemble (mesuré). Balise vide (clic sans
    // glissé) : jetée au passage par TsiUndo, la pile reste propre.
    if (typeof TsiUndo !== 'undefined') TsiUndo.newTransaction('drag');
    piece.posUnlock = true;
    piece.div.style.left = TsiDrag.x0 + 'px';
    piece.div.style.top  = TsiDrag.y0 + 'px';
    const pos = piece.timeline?.getTrack('pos');
    if (pos) { pos.css._anim?.cancel(); pos.css._anim = null; }
    document.addEventListener('mousemove', TsiDrag._move);
    TsiDrag.child?.gotoStopGroup(0);                // onDragStart
    TsiDrag._diffuse('dragStart');
  }

  static _move = (e) => {
    TsiDrag.origin ??= { x: e.clientX, y: e.clientY };
    TsiDrag.delta = { dx: e.clientX - TsiDrag.origin.x, dy: e.clientY - TsiDrag.origin.y };
    const d = TsiDrag.piece.div;                    // LE déplacement de la pièce draggée
    d.style.left = (TsiDrag.x0 + TsiDrag.delta.dx) + 'px';
    d.style.top  = (TsiDrag.y0 + TsiDrag.delta.dy) + 'px';
    TsiDrag.child?.gotoStopGroup(1);                // hook onDrag (optionnel)
    TsiDrag._diffuse('drag');
  };

  //  LES DEUX CANAUX du drag, indépendants et complémentaires :
  //    le TEMPS  — gotoStopGroup(0/1/2) positionne un plateau d'états, DÉCLARÉ par
  //                la valeur de $$drag (cf. _cible) ; canal du VISUEL ;
  //    l'ÉVÉNEMENT — ci-dessous ; canal du COMPORTEMENT, pour qui veut réagir.
  //
  //  DIFFUSION AUX DEUX PORTÉES : sur la Pièce SAISIE (ses abonnés `_this`, qui ne
  //  veulent que SON drag) et sur o_.events (les observateurs quelconques — une
  //  zone de drop, l'éditeur). Sans la première, la forme `_this` ne recevrait
  //  jamais rien ; sans la seconde, il faudrait connaître la Pièce à l'avance.
  //
  //  LE CONTEXTE EST CELUI DU SENDER : construit ICI, un par tir, jamais recopié.
  //  Les abonnés y lisent la Pièce draggée (`_ctx_.piece`) et agissent SUR elle —
  //  contraindre un déplacement à l'horizontale, par exemple. TsiDrag.delta reste
  //  lisible pour connaître le déplacement en cours.
  static _diffuse(eventName) {
    const piece = TsiDrag.piece;
    if (!piece) return;
    const ctx = new TsiCtx(piece, piece.getFaceCurr?.() ?? null, null, 0, null);
    piece.events.send(eventName, ctx);
    o_.events.send(eventName, ctx);
  }

  /** DÉCROCHE la pièce du drag — appelé au mouseup par la piste &drag. */
  static detach(piece) {
    if (TsiDrag.piece !== piece) return;
    TsiDrag.child?.gotoStopGroup(2);                // onDragEnd
    TsiDrag._diffuse('dragEnd');                    // AVANT _release : la Pièce est encore saisie
    TsiDrag._release();
  }

  static _release() {
    document.removeEventListener('mousemove', TsiDrag._move);
    const piece = TsiDrag.piece, delta = TsiDrag.delta;
    if (piece) {
      piece.posUnlock = false;                        // le temps reprend la position
      // ATOME (PD 2026-08-16) : une Pièce draggée n'est PLUS ANIMÉE — sa piste `pos`
      // est RÉDUITE à la position lâchée. reduceToValue mémorise la piste ENTIÈRE :
      // un undo la reconstruit telle quelle (effet d'apparition compris), donc undo
      // sur plusieurs drags remonte de position en position, et l'undo du PREMIER
      // rend la piste animée d'origine.
      // Pas de glissé (delta null) = simple clic : la piste n'est pas touchée, la
      // pile d'undo reste propre.
      const pos = delta && piece.timeline?.getTrack('pos');
      if (pos) pos.reduceToValue([TsiDrag.x0 + delta.dx, TsiDrag.y0 + delta.dy]);
    }
    TsiDrag.piece = TsiDrag.child = TsiDrag.origin = TsiDrag.delta = null;
  }
  //  LA CIBLE du plateau d'états, DÉCLARÉE par la valeur de $$drag :
  //    $$drag      (nu)  aucun plateau d'états — le drag déplace, sans plus
  //    $$drag = 1        le plateau de LA PIÈCE elle-même. Ses frères se
  //                           positionnent avec elle : un plateau est synchrone,
  //                           c'est le modèle Tispi (comme &button).
  //    $$drag = 2        le plateau de sa PIÈCE FILLE (onePiece) — synchro
  //                           interne. Une Face simple n'a pas de Pièce fille :
  //                           null, et aucun hook. C'est un cas normal.
  static _cible(piece) {
    const v = piece.attrs?.['$$drag']?.get();
    const brut = v?.get?.() ?? v;                    // valeur réifiée → brut
    if (brut === 1) return piece;
    if (brut === 2) return piece.onePiece?.() ?? null;
    return null;                                     // drapeau nu (TSI_TRUE) ou absent
  }

}


// ═════════════════════════════════════════════════════════════
//  Piste &drag — SUPPRIMÉE le 2026-08-16 (PD). `$$drag` détient cet office :
//  elle pose les mêmes deux listeners vers TsiDrag, ajoute pointerEvents:auto, et
//  surtout elle a une VALEUR — donc elle peut DÉCLARER la cible du plateau d'états
//  (TsiDrag._cible), ce qu'une piste sans key ne pouvait pas faire.
//  ⚠ `&drag` est désormais une propriété INCONNUE : une page qui l'écrit lèvera au
//    build. Encore présente dans test001/test_drag.html et trois archives memo/ —
//    à convertir en `$$drag = 2;` (PD rapatrie les .html).
//  (Le MOTEUR du drag, class TsiDrag ci-dessus, reste : c'est lui que $$drag appelle.)
// ═════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
//  PISTE onTime  —  action immédiate à l'entrée d'un frame
//
//  Déclenche une fonction UNE SEULE FOIS à chaque entrée dans l'intervalle
//  d'une key. Ne se répète pas tant que le curseur reste dans l'intervalle.
//
//  Différence avec les pistes CSS :
//    — Piste CSS  : setCss() appelé à chaque gotoStop(), même en milieu
//                   d'intervalle (idempotent sur le DOM)
//    — onTime     : action déclenchée uniquement si le curseur atterrit
//                   EXACTEMENT sur le numFrame de la key, ou si exec()
//                   franchit ce frame en mode play
//
//  Déclencheurs :
//    gotoStop(frame)  — fire si frame === key.numFrame
//    gotoPlay(frame)  — gotoStop() d'abord, puis lance le timer vers la key suivante
//    exec()           — fire naturellement quand le play franchit le frame (hérité)
//
//  Pas de transition : transit = null
//
//  Valeur de key :
//    null        → aucune action (intervalle muet)
//    () => {...} → fonction exécutée immédiatement à l'entrée
//
//  Usage :
//    new TsiPiece(div, [
//      ["onTime",  0, null],
//      ["onTime", 10, () => { piece.reset(); }],
//      ["onTime", 20, () => { TsiEditor.bornes.onPieceSelected.dispatch(...); }],
//      ["onTime", 40]   // borne de durée, pas d'action
//    ]);
// ═══════════════════════════════════════════════════════════════════

//  (TsiTrackOnTime SUPPRIMÉE le 2026-08-20. Son ctor n'appelait que super — corps
//   entièrement commenté. Ses gotoStop/gotoPlay RECOPIAIENT le squelette de
//   TsiTrack : la ligne d'armement était identique AU CARACTÈRE PRÈS
//   (`waitInterval(() => keyNext.exec(…))`), car une piste sans transition tombe
//   déjà dans cette branche — TsiCssOnTime déclare `transit = null`, et
//   getTransition sort dès sa première ligne. Leur seule raison d'être était
//   d'ÉVITER LE SNAP de la key courante, qui aurait re-tiré une action passée à
//   chaque goto. C'est désormais dit par le rôle : TsiCssOnTime.snapAuGoto.
//
//   NOTE DE CONCEPTION conservée — au build, la valeur d'une key (liste de strings
//   DSL) deviendrait une liste de TsiFc via buildAction ; k.src garderait la
//   provenance brute pour l'export.)

class TsiKeyOnTime extends TsiKeyCss {
  constructor(numFrame, value) { super(numFrame, value, "onTime"); }
}

class TsiCssOnTime extends TsiCssBase {
  //  REFUS DU SNAP — un événement ne se re-tire pas : la key ne se pose que si elle
  //  tombe PILE sur la frame visée. C'est le corps de l'ancienne
  //  TsiTrackOnTime.gotoStop, ramené au rôle qui le motive (trackFormat = EVENT).
  //  ET LE MÉMO (étape 3, PD 23/08) : le temps qui BOUGE vers une autre frame
  //  efface lastFired — revenir plus tard sur la même key re-tire ; y RESTER, non.
  snapAuGoto(track, s, frame) {
    if (frame !== track.lastFired) track.lastFired = null;
    return s.key?.numFrame === frame;
  }

  static defaultValue = null;
  static track        = TsiTrack;
  static key          = TsiKeyOnTime;
  static trackFormat  = TrackFormat.EVENT;   // action = événement : ne JAMAIS re-tirer un passé

  constructor(pieceMaster) {
    super(pieceMaster);
    this.setCss = (value, track, numFrame, key) => {
      if (value == null) return;
      //  LE MÉMO lastFired (PD 23/08) — « la piste onTime mémorise le numFrame de la
      //  dernière action tirée, pour ne pas répéter si la Pièce n'a pas changé de
      //  temps. » Unifie les TROIS chemins : la chaîne, un goto répété sur la même
      //  frame (avant : 2 gotoStop(10) tiraient 2 fois), et le RATTRAPAGE de fin de
      //  tour, qui peut ainsi balayer généreusement. Repère d'exécution, frère de
      //  keyIndex — pas une vérité de modèle. (Sa DÉCLARATION vit au ctor de
      //  TsiTrack depuis le 23/08, avec lastTreated : elle était posée ici, au fil
      //  de l'eau — deux instances de la même classe n'avaient pas la même forme.)
      if (key) {
        if (track.lastFired === key.numFrame) return;
        track.lastFired = key.numFrame;
      }
      // Tir onTime → BALISE de début de cran d'undo. Les actions du { … } (et leurs atterrissages async) rejoignent ce cran.
      if (typeof TsiUndo !== 'undefined') TsiUndo.newTransaction('onTime');
      // Le porteur de la piste est une Pièce OU une Face : règle isPiece appliquée ICI.
      const porteur = track.piece;
      const face  = porteur.isPiece ? null : porteur;
      const piece = porteur.isPiece ? porteur : porteur.div.parentNode._tsi;
      // numFrame et key viennent de setCssCurr, qui les a déjà en main (tispiTrack.js).
      // Repli sur l'horloge de la PIÈCE pour les appelants qui ne les transmettent pas.
      value.get(new TsiCtx(piece, face, track,
                           numFrame ?? piece._currentFrame(), key ?? null));
    };
    this.transit = null;
  }
}

o_.css.onTime = TsiCssOnTime;


// ═════════════════════════════════════════════════════════════
//  &videoSynchro / &sliderSynchro — pistes comportement : un ÉLÉMENT MÉDIA dans la Face
//  est l'horloge-maître des Pièces esclaves (&clock !<face>)
// ═════════════════════════════════════════════════════════════
//  Le COMMUN (PD 06/10) : la Face CONTIENT un élément qui parle média, et cet élément est
//  l'horloge. Pas de signe : une PARTIE des héritiers, pas une piste — chaque héritier ADOPTE
//  l'élément écrit dans la Face, ou le crée (createMedia). La piste est la DÉCLARATION de la
//  relation (PD 11/10 : toute vidéo n'est pas synchro). Le média vit ICI (this.media) ; la Face
//  le trouve via getClockMaster() (balayage des pistes) ; le SERVICE naît au premier esclave,
//  dans attachToMaster — comme une Pièce maître (S-1).
class TsiCssMediaSynchro extends TsiCssBase {
  static defaultValue = null;
  static track        = TsiTrack;

  constructor(pieceMaster) {
    super(pieceMaster);
    this.media = null;                // l'élément qui parle média (phase A, setup)
    this.clockMasterService = null;   // créé par attachToMaster au premier esclave
    this.setCss  = () => {};          // piste comportement : aucune écriture CSS par key
    this.transit = null;
  }

  /** Phase A (prepareFace, arbre complet) : l'héritier adopte ou crée l'élément. */
  setup(track) {
    let value = track.keys.find(k => k.numFrame >= 0)?.value;
    if (value?.constructor?.isTsiValue) value = value.get(this.pieceMaster);   // valeur réifiée → brut (marqueur, comme setCss/toKeyframe)
    const face = this.pieceMaster;                    // piste de face → pieceMaster = la Face
    const arr  = value == null ? [] : Array.isArray(value) ? value : [value];
    this.media = this.createMedia(face, arr);
    //  `autoplay` — par la piste, ou par l'attribut du média (<video autoplay>, <input data-autoplay>) : lecture dès
    //  la première image, APRÈS le start, quand les esclaves sont attachés (un play() immédiat partirait dans le vide).
    //  Refus du navigateur (son sans clic préalable) : dire la cause, pas une exception non rattrapée — console, pas alert :
    //  c'est la politique du navigateur, pas une faute d'auteur.
    if (arr.includes('autoplay') || this.media.autoplay)
      requestAnimationFrame(() => this.media.play?.()?.catch?.(e =>
        console.warn(`#${face.div.id} : lecture automatique refusée par le navigateur (${e.name}) — écrire la vidéo dans la Face avec \`muted\``)));
  }
}

//  ⚠ Corps actif → TsiBuilder.postBuild.videoSynchro (retiré d'ici le 2026-08-16).
//  Il CASSAIT le build : son commentaire — « super() : buildTrack (keys) + css
//  créés » — décrivait l'ANCIEN ctor de TsiTrack, qui posait keys et css. Depuis
//  la centralisation, le ctor ne pose que l'identité : `this.css.setup(…)` levait
//  sur css null, l'isolation par élément rattrapait, la Face perdait TOUTE sa
//  timeline — et l'alerte visible arrivait trois étages plus loin, en
//  « clockSlave : service clockMaitre invalide » (la piste introuvable au
//  balayage de getClockMaster).
//  (TsiTrackVideoSynchro SUPPRIMÉE le 2026-08-20 — coquille VIDE : le rôle est déclaré en
//   ATTRIBUT par la classe Css (`static track`), son comportement vit dans le
//   css composé. `static track` pointe désormais sur TsiTrack.)
class TsiKeyVideoSynchro extends TsiKeyCss {
  constructor(numFrame, value) { super(numFrame, value, "videoSynchro"); }
}
/**
 * &videoSynchro "chemin.mp4", controls?, autoplay?
 *   chemin   : URL de la vidéo — À QUOTER (le chemin contient . et / que le DSL découperait).
 *   controls : (optionnel) ajoute l'attribut natif `controls` au <video>.
 *   autoplay : (optionnel) lecture dès le start — ⚠ le navigateur la REFUSE avec le son tant que l'utilisateur n'a pas
 *              cliqué : écrire la vidéo dans la Face avec ses attributs natifs, `<video src="…" controls autoplay muted>`,
 *              et la piste nue `&videoSynchro 0:;` dit la relation (S-1, PD 11/10 — mesuré : seule forme qui démarre seule).
 * Le <video> est ÉCRIT DANS LA FACE (son style sur lui) ; absent, la piste le crée. Une Pièce s'y synchronise par &clock !<face>.
 */
class TsiCssVideoSynchro extends TsiCssMediaSynchro {
  static key = TsiKeyVideoSynchro;

  createMedia(face, arr) {
    const src = (arr[0] && arr[0] !== 'controls') ? arr[0] : null;
    let video = face.div.querySelector?.('video');     // réutilise un <video> existant…
    if (!video) { video = document.createElement('video'); face.div.appendChild(video); }  // …sinon le crée
    if (src)                      video.src = src;
    if (arr.includes('controls')) video.controls = true;
    return video;
  }
}
o_.css.videoSynchro = TsiCssVideoSynchro;

class TsiKeySliderSynchro extends TsiKeyCss {
  constructor(numFrame, value) { super(numFrame, value, "sliderSynchro"); }
}
/**
 * &sliderSynchro durée, loop?, autoplay?
 *   durée : en secondes, comme un média.
 *   loop  : (optionnel) le curseur boucle en bout de course ; absent = il s'arrête (« idem CSS », PD 06/10).
 * Le curseur est un <input type="range"> ÉCRIT DANS LA FACE (son style sur lui) ; absent, la piste le crée (S-1, PD 11/10).
 * L'input porte ses réglages, qui PRIMENT sur la piste : max = durée en secondes, value = départ, data-loop, data-autoplay.
 * TsiSlider (tispiTools.js) le pilote et parle média. Ses commandes passent par la Pièce : $sendToFace("gotoAndPlayValue", …).
 */
class TsiCssSliderSynchro extends TsiCssMediaSynchro {
  static key = TsiKeySliderSynchro;

  createMedia(face, arr) {
    const input = face.div.querySelector('input[type=range]')                 // le curseur écrit dans la Face…
               ?? face.div.appendChild(document.createElement('input'));      // …sinon le crée
    return new TsiSlider(input, Number(arr[0]) || 0, arr.includes('loop'));
  }
}
o_.css.sliderSynchro = TsiCssSliderSynchro;

//  (TsiTrackText SUPPRIMÉE le 2026-08-20 — coquille VIDE : le rôle est déclaré en
//   ATTRIBUT par la classe Css (`static track`), son comportement vit dans le
//   css composé. `static track` pointe désormais sur TsiTrack.)
class TsiKeyText   extends TsiKeyCss { constructor(f, v){ super(f, v, "text"); } }

// &text — concern TEMPOREL du texte (PD 2026-07-10) : contenu et attributs DATÉS,
// compatible Pièce (keys sur le plateau → face courante) ET Face (valeur unique).
// LIBÉRÉ de l'autoSize (l'instantané-de-face vit dans &size -1, -1). Le temporel
// (t --textContent du format module, bascules discrètes) : implémentation à venir.
class TsiCssText extends TsiCssBase {
  static defaultValue = null;
  static track        = TsiTrack;
  static key          = TsiKeyText;
  constructor(pieceMaster){
    super(pieceMaster);
    this.setCss  = () => {};      // comportement : aucune écriture CSS par key
    this.transit = null;
  }
}
o_.css.text = TsiCssText;

// (l'ex-piste &autoSize est SUPPRIMÉE — PD 2026-07-10 : autoSize n'est pas une
//  piste mais une VALEUR de &size : la sentinelle -1,-1, commande d'affectation
//  du mode intrinsèque CSS. Cf. ensureSizeTrack (synthèse) et TsiCssSize.toKeyframe.)




//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________
//__________________________________________________________________________________________________________________








// ═════════════════════════════════════════════════════════════
//  VARIABLES DE PIÈCE  ($nom := …; / $nom = this; / lecture $nom)
//  La table piece.vars = LA vérité ; le CSS transporte (custom property
//  QUALIFIÉE par le déclarant : --tsi<idUnic>-nom — les homonymes d'autres
//  branches sont d'autres noms CSS ; barrières et pipes appliqués par NOTRE
//  remontée, la cascade ne fait que propager les valeurs). setVar = O(1).
// ═════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiVar.js  (2498 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

/** Nom du paramètre CONTEXTE injecté dans tout code JavaScript écrit par l'auteur —
 *  bloc `{ … }` d'une action comme corps d'une fonction. Sigillé des deux côtés : un auteur ne
 *  le heurtera pas avec un de ses propres paramètres, donc aucune garde à écrire. */
const TSI_CTX = '_ctx_';

// ═══════════════════════════════════════════════════════════════════════════
//  TsiCtx — L'ENVIRONNEMENT D'UN TIR
// ═══════════════════════════════════════════════════════════════════════════
//  Ce que reçoit toute fonction Tispi — système comme auteur — et tout bloc
//  `{ … }`, sous le nom `_ctx_`. Jamais un seul élément : un tir a toujours
//  un PORTEUR, une PISTE d'où il part, une FRAME, et le plus souvent une KEY.
//
//  CONSTRUIT PAR LE DÉCLENCHEUR, un par tir, et c'est CE MÊME OBJET qui descend
//  toute la chaîne — TsiJs.get → TsiValFunc.get → run → _fn. Aucun étage
//  n'en fabrique un second à partir du premier : deux exemplaires divergeraient
//  et l'on ne saurait plus lequel fait foi.
//
//  PIÈCE ET FACE SÉPARÉMENT, et le programmeur choisit ce qui convient. `piece`
//  est TOUJOURS renseignée — c'est elle qui porte l'horloge, le plateau, la durée ;
//  une Face n'a rien de tout cela. `face` n'est renseignée que si le tir part d'une
//  Face. Le déclencheur applique la règle `isPiece` UNE fois et remplit les deux ;
//  personne ne la réapplique ensuite.
//
//  Deux champs, et RIEN d'autre : pas de troisième nom qui reprendrait le choix au
//  programmeur. Ce qui relève du temps ou du plateau lit `piece` ; ce qui relève de
//  l'élément exact d'où part le tir écrit `face ?? piece`, en clair, à chaque fois.
class TsiCtx {
  /** @param {TsiPiece}  piece    la Pièce concernée — jamais nulle
   *  @param {TsiFace}   face     la Face exécutante, ou null
   *  @param {TsiTrack}  track    la piste d'où part le tir
   *  @param {number}    numFrame la frame traitée — lue sur la PIÈCE
   *  @param {TsiKey}    [key]    la key franchie, quand il y en a une */
  constructor(piece, face, track, numFrame, key = null) {
    this.piece    = piece;
    this.face     = face;
    this.track    = track;
    this.numFrame = numFrame;
    this.key      = key;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  TsiVar — LA VARIABLE (forme, choisie par l'OPÉRATEUR), au-dessus de
//  TsiVal (le contenu). Tue le string `kind` au niveau variable.
//  5 formes : Decl (:=) · Slot (:= ;) · Pipe (:= _import) · Pub (=) · Reader ($nom nu).
//  Seules Decl/Pub portent une valeur (this.value = une TsiVal).
// ═══════════════════════════════════════════════════════════════════════════
class TsiVar {
  static isTsiValue = true;
  // ⚠ MODULE — BRANCHEMENT 3/4 vers tispiModules.js, NEUTRALISÉ le 2026-08-09 en
  //   vue de sa suppression. `o_.getModule(nom).sponge` disait si un module est une
  //   ÉPONGE À CONTEXTE (branche ouverte, typiquement un contrôle). Débranché, tout
  //   module redevient FERMÉ — le défaut, donc le repli sûr. Alerte UNE SEULE fois :
  //   la barrière est évaluée à chaque remontée d'ancêtre.
  //   À REPRENDRE : le contrat « module fermé sauf sponge » du bac-à-sable (§5 VARIABLES.md).
  static _sponge(nomModule) {
    if (!TsiVar._spongeAlerte) {
      TsiVar._spongeAlerte = true;
      TsiError.warning(`MODULE SUPPRIMÉ — barrière de variables : l'option « sponge » du module `
        + `« ${nomModule} » n'est plus lue (tispiVar.js, branchement 3/4). Branche traitée comme FERMÉE.`);
    }
    return undefined;                  // pas d'éponge → !undefined = barrière fermée
  }
  static _spongeAlerte = false;
  static HEADER = 'HEADER';   // situation : var en zone de tête (→ piece.vars)
  static TRACKS = 'TRACKS';   // situation : var en position de piste
  static VALUE  = 'VALUE';    // situation : var en valeur de key / transition
  //  Les MOTS de déclaration de la grammaire IA (PD 07-08/09, 39g) : la phase (let = exécution, const = construction,
  //  css = propriété --nom) et, avec le suffixe Module, le PARAMÈTRE de module (exposé à l'instance).
  static DECLAR = new Set(['let', 'const', 'css', 'letModule', 'constModule', 'cssModule']);
  constructor(nom, piece, ctx) {
    this.nom = nom;
    this.pieceId=piece.idUnic;
    this.ctx=ctx;
    this.value=null;  // valeur runtime (Decl/Pub) — Slot/Pipe/Reader n'ont pas de valeur propre.
    this.rules = null;  // contrat d'édition `~<…>` — était posé AU FIL DE L'EAU (deux formes) : déclaré ICI (20/08)
    this.attrs = {};    // ATTRIBUTS de variable (exposition, PD 20/08) — `$nom<$$xl> := …` : même organe que partout
    this.declar  = null;   // le MOT de déclaration écrit (let | const | css | *Module) — null pour les formes moteur (`:=`, `=`)
    this.isParam = false;  // paramètre de module (mot *Module) : exposé à l'instance (39g)
  }
  //  LES LECTURES À VÉRIFIER (PD 08/10) : chaque `$nom` LU — tête, valeur de key, corps JS — se note à sa naissance avec sa
  //  position dans le data-tsi ; o_.start, l'arbre complet (sœurs du plateau, modules expansés), les vérifie toutes par resolveVar.
  static _reads = [];
  static noteRead(v, pos) { v.srcPos = pos; TsiVar._reads.push(v); return v; }
  static checkReads() {
    const reads = TsiVar._reads; TsiVar._reads = [];
    for (const v of reads) {
      const piece = v.getPiece(); if (!piece) continue;          // Pièce retirée avant le start : le lien mort se tait (contrat TsiIdUnic)
      if (TsiVar.resolveVar(piece, v.nom)) continue;
      TsiError.error(TsiTokenizer.posError(piece.div.dataset.tsi, v.srcPos,
        `${v.nom} : aucune déclaration au-dessus (let, const ou css)${TsiVar._near(piece, v.nom)}`, piece.div));
    }
  }
  //  La faute de frappe la plus courante : un nom déclaré à un `_` ou une majuscule près.
  static _near(piece, nom) {
    const norm = s => s.replace(/_/g, '').toLowerCase(), k = norm(nom);
    for (let el = piece.div; el; el = el.parentElement) {
      const p = el._tsi; if (!p) continue;
      for (const q of p.isPiece ? [p, ...p.platePieces()] : [p])
        for (const key of q.vars?.keys() ?? [])
          if (key.endsWith('$') && norm(key.slice(0, -2)) === k) return ` — déclarée à proximité : ${key.slice(0, -2)}`;
    }
    return '';
  }
  getPiece() { return this.pieceId?.get(() => { this.pieceId = null; }); }  // ⚠ SEAM registre — lien mort : le champ se vide

  //  BALAYE LA CIBLE pour $nom (déménagée de TsiValPath à la coupe, 26/08 — elle
  //  balaie des VARIABLES, sa famille est ici). Jamais de remontée gratuite :
  //  déclaration (en-tête OU valeur-de-key) → elle-même ; get/set → sa déclaration.
  static scanPiece(cible, nom) {
    const declH = cible.vars?.get(nom + '$$');
    if (declH) return declH;                                                // déclaration d'EN-TÊTE
    if (cible.vars?.get(nom)) return TsiVar.resolveVar(cible, nom)?.entry;  // get/set d'en-tête → sa déclaration
    for (const track of cible.timeline?.tracks ?? [])
      for (const key of track.keys ?? []) {
        const found = key.value?.findVar?.(nom);                            // la var EST la valeur-de-key, ou dedans (script)
        if (found)
          return found.key !== found.nom ? found                           // déclaration de key (clé dérivée ≠ nom) → elle-même
                                         : TsiVar.resolveVar(cible, nom)?.entry;  // get/set → sa déclaration
      }
    return null;
  }

  //  ⚠ `valueJs` et NON `value` : `this.value` est un CHAMP de la famille — la
  //    TsiVal que porte une déclaration ; un accesseur `value` le masquerait.
  //  L'ACCÈS DEPUIS UN SCRIPT (fusion de TsiVarJs, coupe 26/08) : les deux sens
  //  passent par resolveVar — la valeur va CHEZ LE DÉCLARANT, jamais chez
  //  l'occurrence. Sur une CIBLE de chemin, TsiVarRef relaie par scanPiece.
  get valueJs()  { return TsiVar.resolveVar(this.getPiece(), this.nom)?.entry.get(); }
  set valueJs(v) { TsiVar.resolveVar(this.getPiece(), this.nom)?.entry.setValue(v); }
  static buildClass(tk, piece, ctx) {
    const inst = TsiVar._buildClass(tk, piece, ctx);
    const t = tk.peek(true);                               // RE-PEEK après compilation (t était le 1er token de la cellule ; tk a avancé)
    if(t.val===';'){ // consomme le ';' SEULEMENT en HEADER (le ';' est le terminateur de la var) ; en VALUE il est à la key (_track), en TRACKS au track
      tk.next();
    }
    return inst;
  }
  // FABRIQUE — LE composant prend en charge SON parsing (règle générique).
  //  Entrée : tk positionné SUR le token `$nom`.  Sortie : tk APRÈS le ';'.
  //  Dispatch : `:=` → Decl/Slot/Pipe · `=` → Pub · aucun op → Reader ($nom nu).
  static _buildClass(tk, piece, ctx) {
    const tNom = tk.next(true), nom = tNom.val;   // consomme `$nom`, garde le '$' (string). Pourquoi se compliquerions nous le travail ?
    // (La clé de déclaration nom+'$$' n'est PLUS le nom de l'instance : le nom est
    //  un ÉTAT, la clé se DÉRIVE — `get key()`, polymorphe par forme. Le debuild
    //  ré-émet donc `$prix := …`, relisible, et non `$prix$$ := …`.)
    // BLOC DE QUALIFICATION : lu APRÈS le nom, AVANT le discriminant — il qualifie
    // la VARIABLE. UN SEUL signe (PD 2026-08-20) : `<` suivi d'un SIGIL, avec ou
    // sans espace — `$nom<$$xl> := …`. Même service que les blocs de piste/key
    // (TsiNodeBuilder._blockHeader).
    // ⚠ `~<` EST SUPPRIMÉ (PD 20/08) — le tokenizer n'assemble plus le composite,
    //   c'est voulu. La machinerie rules (TsiEditorVarRules, v.rules, _rules())
    //   reste en place : les caractéristiques d'édition rejoindront CE bloc-ci
    //   (fusion actée), leur écriture dedans reste à définir.
    let rules = null, hAttrs = null, rulesPos = null;
    while (tk.peek(true) !== TsiTokenizer.END
           && tk.peek(true).val === '<' && TsiNodeBuilder._atBlockHeader(tk))
      TsiNodeBuilder._blockHeader(tk, piece, hAttrs ??= {});
    const op  = tk.peek(true);                          // ':=' | '=' | (autre → pas d'op)
    let v;
    //  (`$nom` suivi de la fin du flux = une LECTURE, comme `$nom;` — la fin d'une valeur de key bornée se lit END : étape V-1, 01/10)
    //______________________________________________________________________________
    // DÉCLARATION PAR LE MOT (grammaire IA, PD 07-08/09) : `let|const|css $nom = v;` et les trois `*Module` (paramètres, 39g).
    // Le mot vient du ctx (posé par buildHead) ; `:=` reste lu plus bas (forme moteur, dépréciée — retirée quand les pages seront migrées).
    const declar = ctx.declar ?? null;
    if (declar && op.val !== '=')
      throw new Error(TsiTokenizer.posError(tk.str, op.pos, `${declar} ${nom} : '=' attendu`));
    if (declar) {
      const t = tk.nextPeek(true);        // consomme '=' ; t = 1er token de la valeur
      if (t.type === 'ident' && t.val === '_import') { tk.next(); v = new TsiVarPipe(nom, piece, ctx); }   // `let $x = _import;` — le tuyau
      else {
        v = declar.startsWith('css') ? new TsiVarCss(nom, piece, ctx) : new TsiVarDecl(nom, piece, ctx);
        v.value = TsiVal.aiguillage(tk, piece, ctx);   // `null` → TSI_NULL · `this` → TsiValThis · backticks → macro : l'aiguillage décide
      }
      v.declar  = declar;                 // ré-émis tel quel au debuild
      v.isParam = declar.endsWith('Module');
    } else
    //______________________________________________________________________________
    // VAR SET
    if (op.val === '=') {                 // nomVar = valeur    - PUBLICATION (affectation)
      tk.next();
      v = new TsiVarSet(nom, piece, ctx);
      v.srcPos = op.pos;
      v.value = TsiVal.aiguillage(tk, piece, ctx);   // ⚠ CHANTIER JS_Script — même parsing partout
    //______________________________________________________________________________
    // VAR DECLARATION
    } else if (op.val === ':=') {         // nomVar := ...      - DÉCLARATION / SLOT / PIPE
      const t = tk.nextPeek(true);        // consomme '=:' puis retourne token APRÈS ':='  — nomVar := _import  — PIPE (porte null, pas de TsiVal)
      //_______________________________________
      // import : le tuyau traverse la barrière de module (ou $$autonomous) — le parent est lu, pas le porteur. Le tuyau est MUET : il ne porte pas de valeur, juste un lien vers le parent.
      if (t.type === 'ident' && t.val === '_import') { tk.next(); v = new TsiVarPipe(nom, piece, ctx); }   // PIPE = une déclaration (sa clé dérive : nom+'$$')
      //_______________________________________
      // _null : la déclaration ne porte PAS de TsiVal (la valeur est null). Le parent n'est pas lu, le tuyau est MUET. Le parent peut être lu par un lecteur (nomVar nu) ou un slot (nomVar = …).
      else if (t.type === 'ident' && t.val === '_null') { tk.next(); v = new TsiVarDecl(nom, piece, ctx); }
      //_______________________________________
      // := valeur — DÉCLARATION (porte une TsiVal)
      else { v = new TsiVarDecl(nom, piece, ctx); v.value = TsiVal.aiguillage(tk, piece, ctx); }   // ⚠ CHANTIER JS_Script — l'aiguillage décide (site d'accueil du parseur texte)
    } else {                              // nomVar              —  LECTURE
    //______________________________________________________________________________
    // VAR GET
      v = TsiVar.noteRead(new TsiVarGet(nom, piece, ctx), tNom.pos);   // vérifiée au start (D-2)
    }
    //_____________________________________________________________________________________________________________
    // $myVar <CONTRAT> := valeur ;  — le contrat appartient à la déclaration, pas à la publication ni à la lecture.
    // Le CONTRAT appartient à la DÉCLARATION : une publication ne déclare rien,
    // une lecture encore moins. Faute d'auteur → erreur localisée, pas un silence.
    if (rules) {
      if (!(v instanceof TsiVarDecl || v instanceof TsiVarPipe))
        throw new Error(TsiTokenizer.posError(tk.str, rulesPos,
          `${nom} : caractéristiques ~<…> sur une ${v instanceof TsiVarSet ? 'publication' : 'lecture'}`
          + ` — le contrat appartient à la déclaration`));
      v.rules = rules;
      rules.check(v.value);                          // TYPE : validé une fois la valeur construite
    }
    if (hAttrs) Object.assign(v.attrs, hAttrs);      // en-tête `<$$…>` — versé, la forme du ctor ne change pas
    return v;
  }
  /** Remontée au déclarant depuis `piece` : masquage (déclaration la plus proche),
   *  BARRIÈRE (module ou $$autonomous : la remontée s'arrête au plafond, sauf
   *  PIPE nominatif `$nom := $parent;` qui traverse). 
   * static resolveVar = function (piece, nom) { … return { declarant: p, entry: var_ }; … };
// + alias : Tsi_.resolveVar = TsiVar.resolveVar;

   * @returns {piece-declarant, var_} | null
   * */
  static resolveVar = function (piece, nom) {
    let sisters = nom.startsWith('$_');            // `$_nom` : portée de PLATEAU (PD 07/10) — une fois, au premier niveau Pièce
    for (let el = piece.div; el; el = el.parentElement) {
      const p = el._tsi;
      if (!p) continue;
      const var_ = p.vars?.get(nom+'$$');                            // resolveVar cherche TOUJOURS une déclaration (clé nom+'$$' ; Set/lecteur en `nom` nu = invisibles)
      if (var_ && !var_.isPipe) return { declarant: p, entry: var_ };   // formes réifiées : plus de `kind` string, un Pipe se traverse
      // BARRIÈRE sans déclaration ni pipe pour ce nom → plafond fermé.
      // Défauts (PD) : module = FERMÉ (sauf `sponge: true` dans sa déclaration —
      // l'éponge à contexte, typiquement un contrôle) ; branche ordinaire =
      // OUVERTE (sauf $$autonomous). L'option est modifiable des deux côtés.
      if (!var_) {
        const barrier = p.attrs?.['$$autonomous']
          || (p.module != null && !TsiVar._sponge(p.module));
        if (barrier) return null;
      }
      if (sisters && p.isPiece) {
        sisters = false;
        for (const s of p.platePieces()) {
          const v = s.vars?.get(nom+'$$');
          if (v && !v.isPipe) return { declarant: s, entry: v };
        }
      }
    }
    return null;
  };

  // apply(piece)  { piece.ensureVars().add(this.nom, this); }   // MORT — l'inscription se fait AU FIL de la compilation (par position, pas par type), pas dans une passe apply() différée
  build(_tk)  {}                                     // 2e passe (parsing propre à la forme) — no-op ; seul TsiVarMacro l'active
  init()        {}                                     // hook UNE FOIS à o_.start — no-op ; seul TsiVarSet l'active (publication)
  //  MES PORTEURS : mes attributs (`$nom<$$xl> := …`) et ma valeur. Cf. TsiVal.
  messageComponents(onComp) {
    for (const nom in this.attrs) {
      const a = onComp(this.attrs[nom], 'attr'); if (a && a !== 'continue') return a;
      const w = this.attrs[nom].messageComponents(onComp); if (w) return w;
    }
    const v = this.value;
    if (!v) return;
    const r = onComp(v, 'value'); if (r && r !== 'continue') return r;
    return v.messageComponents?.(onComp);
  }
  getValue()    { return this.value; }                 // l'OBJET (la TsiVal portée)
  //  PRODUIT : l'objet rend sa valeur (résout lecteur/pipe puis délègue).
  //  ⚠ LE CONTEXTE EST THREADÉ (PD 2026-08-18) : une variable peut tenir une ACTION
  //  (`$fc02 := { $helloWord(…) };` puis `&onClick 0:$fc02;`) — son exécution a
  //  besoin du ctx DU TIR (la cascade de fonctions remonte depuis lui). Sans le
  //  fil, `_ctx_` arrivait undefined et seules les fonctions SYSTÈME répondaient
  //  (mesuré : « fonction $helloWord inconnue — connues : [système seul] »).
  //  Les lecteurs sans contexte ne passent rien : comportement inchangé.
  get(ctx)      { return this.getValue()?.get(ctx); }
  get isPipe()  { return false; }                      // relation de barrière (resolveVar)
  setValue(v)   { this.value = new TsiValConst(v); }   // brut → objet (TsiValConst), déposé
  get key()     { return this.nom; }                   // clé dans la table de vars — DÉRIVÉE du nom (Decl/Pipe : nom+'$$'), jamais stockée
  findVar(nom)  { return this.nom === nom ? this : null; }   // scan Pièce : le nom est UNIFORME (la clé, elle, discrimine)
  _rules()  { return this.rules ? ' ' + this.rules.debuild() : ''; }   // bloc ~<…> : ré-émis entre le NOM et l'opérateur
  //  EN-TÊTE `<$$…>` de la variable — ré-émis APRÈS les règles, AVANT l'opérateur ;
  //  chaque attribut s'écrit LUI-MÊME (TsiAttr.debuild, forme développée).
  _attrsBlock() {
    const noms = Object.keys(this.attrs);
    if (!noms.length) return '';
    const c = { dt: ' <' };
    noms.forEach((n, i) => { if (i) c.dt += '; '; this.attrs[n].debuild(c); });
    return c.dt + '>';
  }
  //  DEBUILD — contrat UNIQUE de l'étage valeur : debuild(ctx), accès AVEUGLE.
  //  L'appelant ne sait ni le type ni la forme : chaque héritier écrit SA source
  //  dans ctx.dt. Une VALEUR est SANS CLÔTURE INTERNE (table des clôtures PD) —
  //  elle n'écrit jamais de ';'. Le ';' des formes d'EN-TÊTE (Decl, Pipe) est
  //  leur clôture d'ITEM de variable, écrite en dur ; TsiVarSet, SEULE forme à
  //  vivre dans les deux positions, reçoit sa clôture du CONTENANT (term).
  debuild(ctx) { ctx.dt += this.nom; }
}

// ── DECL : $nom := <valeur>;  — porte une TsiVal ──────────────────────────
class TsiVarDecl extends TsiVar {
  get key() { return this.nom + '$$'; }                // clé de DÉCLARATION (resolveVar la cherche ainsi)
  debuild(ctx) {                                       // `let $nom = valeur;` — `:=` n'est plus émis (PD 07/09) ; sans valeur : `null`
    ctx.dt += (this.declar ?? 'let') + ' ' + this.nom + this._rules() + this._attrsBlock() + ' = ';   // forme d'EN-TÊTE → ';' en dur (clôture d'item)
    const v = this._exportValue();
    if (v) v.debuild(ctx); else ctx.dt += 'null';
    ctx.dt += ';';
  }
  //  LA VALEUR EXPORTÉE (PD 14/10) : la courante — ou le défaut `<$$default = …>` quand le nœud déclarant a reçu
  //  `$$openDefaultValue` vrai dans la descente de mise en place (node.openDefault). Sans défaut déclaré : la courante.
  _exportValue() {
    const d = this.attrs['$$default'];
    return d && this.getPiece()?.openDefault ? d.get() : this.value;
  }
  // get()/setValue() hérités : this.value TIENT le <val> ; seul le Reader l'exécute
  
}


// ── CSS : css $nom = [valeur, unité];  — la variable Tispi dont la valeur VIT dans la propriété `--nom` (PD 07/09) ─
//  Bouchon de l'étape 2 (08/09) : pose et réécriture de la propriété sur la div déclarante, lecture `var(--nom)`
//  par les pistes. Viendront : `$thisCss` / `$cssOf` (Proxy, tispiFuncs.js) et, en VÉRIFICATION, le typage
//  (registerProperty, 39f). Une publication d'instance (`$rx = [90, 'deg'];`) passe par setValue : la propriété suit.
class TsiVarCss extends TsiVarDecl {
  get cssName()  { return this.nom.replace(/^\$/, '--'); }   // LE point d'échange de sigil `$` → `--` (comme le tokenizer `@` → `$$`)
  cssText()      { const v = this.value?.get(); return Array.isArray(v) ? v.join('') : (v == null ? '' : String(v)); }   // [20,'deg'] → 20deg
  _pose()        { this.getPiece()?.div?.style?.setProperty(this.cssName, this.cssText()); }
  init()         { this._pose(); }                                          // à la construction : la propriété existe dès le départ
  setValue(v)    { super.setValue(v); this._pose(); }                         // publication d'instance, écriture de script : la propriété suit
  getValue()     { return this._ref ??= new TsiValConst('var(' + this.cssName + ')'); }   // ce que LISENT les pistes : la référence CSS
  cssValue()     { return this.value; }                                       // la valeur déclarée (l'objet)
  //  ÉCRITURE DE SCRIPT (`$thisCss.rx = 180`, étape 6) : un nombre nu prend l'UNITÉ déclarée (`[20, 'deg']` → `[180, 'deg']`) ;
  //  une chaîne ou un tableau passent tels quels. Puis la propriété suit (setValue → _pose).
  assign(v) {
    const cur = this.value?.get();
    if (typeof v === 'number' && Array.isArray(cur) && cur.length === 2) v = [v, cur[1]];
    this.setValue(v);
  }
  static proxyOf(piece) { return new TsiCssProxy(piece); }                    // `$thisCss` / `$cssOf(élément)`
  debuild(ctx) {                                                              // `css $nom = [v, u];` — les crochets sont au SITE
    ctx.dt += (this.declar ?? 'css') + ' ' + this.nom + this._rules() + this._attrsBlock() + ' = ';
    const v = this._exportValue();
    const arr = v instanceof TsiValArray;
    if (arr) ctx.dt += '[';
    if (v) v.debuild(ctx); else ctx.dt += 'null';
    if (arr) ctx.dt += ']';
    ctx.dt += ';';
  }
}


// ── LE PROXY CSS : `$thisCss.rx = 180` · `$cssOf($monde).ry = $val` (PD 07/09) — un couple getter/setter PAR NOM,
//  qui écrit SUR l'élément déclarant (sémantique DOM : la variable `--rx` vit sur sa div). Le nom est nu côté JS (`rx`),
//  la variable est `$rx` : la remontée est celle de resolveVar depuis la Pièce donnée. Lecture d'un nom inconnu → undefined
//  (le JS le tolère) ; ÉCRITURE sur une variable qui n'est pas css, ou qui n'existe pas → erreur nommée.
class TsiCssProxy {
  constructor(piece) { this.piece = piece; return new Proxy(this, TsiCssProxy.handler); }
  static handler = {
    get(self, name) {
      if (typeof name !== 'string') return undefined;
      return TsiCssProxy.decl(self.piece, name, false)?.cssText();
    },
    set(self, name, v) { TsiCssProxy.decl(self.piece, name, true).assign(v); return true; },
  };
  /** La déclaration css `$name` visible depuis `piece` ; strict → erreur nommée si elle manque ou n'est pas css. */
  static decl(piece, name, strict) {
    const entry = TsiVar.resolveVar(piece, '$' + name)?.entry;   // le sigil est RENDU au nom JS (échange, jamais ôté)
    if (entry instanceof TsiVarCss) return entry;
    if (!strict) return null;
    const ou = `#${piece?.div?.id ?? '?'}`;
    TsiError.error(entry ? `$thisCss.${name} : $${name} n'est pas une variable css (déclarée ${entry.declar ?? 'let'}) — depuis ${ou}`
                         : `$thisCss.${name} : aucune variable css $${name} au-dessus de ${ou}`);
  }
}

// ── PIPE : $nom := _import;  — perce le plafond de module (tuyau MUET) ─────────
class TsiVarPipe extends TsiVar {
  get isPipe() { return true; }
  get key()  { return this.nom + '$$'; }               // un pipe EST une déclaration — même clé
  debuild(ctx)  { ctx.dt += (this.declar ?? 'let') + ' ' + this.nom + this._rules() + this._attrsBlock() + ' = _import;'; }   // forme d'EN-TÊTE → ';' en dur

  // La déclaration du nœud AU-DESSUS de la barrière (getAncestor ; barrière-aware dans le callback).
  _up() {
    const piece  = this.getPiece();
    const var_ = piece?.getAncestor((p, key) => {
          const var_ = p.vars?.get(key);                         // par la CLÉ de déclaration (nom+'$$')
          if (var_) return var_;                                 // Decl/Slot… ou Pipe → chaîne
          const barrier = p.attrs?.['$$autonomous']
                       || (p.module != null && !TsiVar._sponge(p.module));
          return barrier ? 'break' : 'continue';
        },
        this.key
    );
    if (!var_) { const m = `${this.nom} := _import : rien à importer au-dessus`;
                  if (o_.options.warningStop) TsiError.error(m); else TsiError.warning(m); }
    return var_;                                      // une TsiVar (Decl/Slot… ou Pipe), ou undefined
  }
  getValue()  { return this._up()?.getValue(); }       // descente : rend l'OBJET du déclarant (get() hérité produit)
  setValue(v) { this._up()?.setValue(v); }             // montée : écrit chez le parent
}


// ── PUBLISH : $nom = <valeur>;  — ACTION : présente la valeur à un Slot ou une déclaration au-dessus ─
class TsiVarSet extends TsiVar {
  constructor(nom, piece, ctx) {
    super(nom, piece, ctx);
    this.srcPos = null;   // position du `=` dans le data-tsi : l'erreur du start (init) la montre dans son contexte
  }
  /** PUBLICATION — `$nom = <valeur>;`
   *  Hook d'apply (pose des variables construites dans la structure de la Pièce).
   *  Pub NE s'inscrit PAS dans la table `vars` du porteur (≠ Decl/Slot/Pipe/Reader) :
   *  ce n'est pas une déclaration mais une ACTION MONTANTE. Elle :
   *    1. retrouve son porteur (registre, via `pieceId`) ;
   *    2. remonte au DÉCLARANT de `$nom` (`resolveVar`, barrières comprises) —
   *       publier sans déclarant au-dessus = erreur BLOQUANTE ;
   *    3. évalue SA valeur dans SON ctx (`this.value.get({piece})`, typiquement
   *       une Pièce) et la remet au déclarant via `publish?.()` — un Slot mémorise
   *       la Pièce reçue (son `idUnic`) ; le `?.` tolère un déclarant non-publiable ;
   *    4. note la publication sur la Pièce (`_varPubs`) pour que l'export
   *       ré-émette le `$nom = …;` à cet endroit (le Slot, lui, émet `$nom := ;`).
   *  Sens du flux : la valeur MONTE (porteur → déclarant). Symétrique du Reader,
   *  dont la valeur DESCEND (déclarant → lecture). Cf. `TsiVarSlot.publish`/`get`.
   */

  // PUBLICATION one-shot, jouée UNE FOIS à o_.start (≠ get() lazy chaque lecture,
  // ≠ set() impératif runtime). Trouve la déclaration au-dessus (resolveVar) et y
  // dépose la valeur résolue. Sans paramètre : pièce/ctx sont des attributs.
  init() {
    const piece = this.getPiece();
    const decl  = TsiVar.resolveVar(piece, this.nom)?.entry;
    if (!decl) TsiError.error(TsiTokenizer.posError(piece.div.dataset.tsi, this.srcPos,
      `${this.nom} = … : aucune déclaration au-dessus (let, const ou css) — à déclarer avant de l'affecter`, piece.div));
    decl.setValue(this.value.get());     // valeur résolue → déposée dans la déclaration
  }
  setValue(value){}

  //  SEULE forme à vivre dans les DEUX positions — item d'en-tête (`$pub = this;`)
  //  ET terminal de path (`….$v = 5`, sans clôture : la valeur n'en a pas) :
  //  le CONTENANT transmet la clôture (le path passe '' ; l'en-tête laisse le défaut).
  debuild(ctx, term = ';') { ctx.dt += this.nom + ' = '; this.value.debuild(ctx); ctx.dt += term; }
}

// ── READER : $nom  (nu) — LECTURE : occurrence use-site, porte le ctx ─────────
//  Ne DÉCLARE rien : résout la déclaration (resolveVar depuis SON conteneur) et
//  lit dans SON ctx (l'instance lue). Va quand même dans `vars` comme toute
//  occurrence — l'export la ré-émet via debuild() (`$nom;`).
class TsiVarGet extends TsiVar {
  static get(piece, name) { return (TsiVar.resolveVar(piece, name)?.entry).getValue(); }
  getValue() { return (TsiVar.resolveVar(this.getPiece(), this.nom)?.entry).getValue(); }  // résout la déclaration → son OBJET (get() hérité produit)
  setValue(v){  }            // C'est une variable de lecture : ne reçoit pas d'affectation (la valeur est dans le déclarant)
  // apply hérité : s'inscrit dans vars comme toute occurrence (nécessaire à l'export)
  // debuild hérité : `$nom;`
}

// ── JS : $nom  DANS UN CORPS JAVASCRIPT — ni lecture ni écriture : une RÉFÉRENCE ─
//  Le corps d'action étant du JavaScript, le convertisseur ne peut pas savoir si
//  `$nom` sera lu ou écrit : c'est JS qui décide, selon la position. Le même objet
//  doit donc faire les DEUX — d'où une classe à part, et non TsiVarGet (dont le
//  setValue est vide) ni TsiVarSet (qui porte une valeur, absente ici).
//
//      $nom          →  _t[i].valueJs           (lecture)
//      $nom = 5      →  _t[i].valueJs = 5       (écriture)
//
//  (TsiVarJs — FUSIONNÉE dans TsiVar à la coupe du 26/08 : « ce n'est plus qu'un
//   seul objet TsiVar » (PD). `valueJs` vit désormais sur la famille, l.ci-dessus.)

//  LA MÊME VARIABLE, MAIS SUR UNE AUTRE CIBLE — ce que rend `composant.var(_t[i])`.
//  TsiVarJs résout depuis SON porteur (la Pièce où le bloc est écrit) ; au bout d'un
//  chemin, la variable appartient à la CIBLE, et se cherche par scanPiece — en-tête
//  d'abord, puis les valeurs de key.
//  Pourquoi un objet à part plutôt qu'un champ posé sur _t[i] : la table est PARTAGÉE
//  par tous les tirs du bloc, y poser une cible la rendrait réentrante. L'objet lié
//  naît par appel — c'est le prix de la justesse, et il se mesure en nanosecondes.
class TsiVarRef {
  constructor(cible, v) { this.cible = cible; this.v = v; }
  get valueJs()  { return this._decl()?.get(); }
  set valueJs(x) { this._decl()?.setValue(x); }
  _decl() { return TsiVar.scanPiece(this.cible, this.v.nom); }
}


//     ####    ####       #####         ####              
//     ####    ####      ########       ####
//      ####  ####      ####  ####      ####
//      ####  ####      ####  ####      ####
//       ########      ############     ####
//        ######       ####    ####     ####
//         ####        ####    ####     ############
//


// ═══════════════════════════════════════════════════════════════════════════
//  tispiValue.js — RÉIFICATION des VALEURS DE VARIABLE (périmètre : valeurs de var)
//
//  Le `kind` string (fausse-polymorphie accrétée) meurt : UNE CLASSE par TYPE de
//  valeur. Chacune possède SON cycle complet — plus aucun if/else de dispatch.
//
//    TsiVal.buildClass(tk, piece, ctx)   → FABRIQUE : peek le flux, choisit la classe,
//                                   `new` puis DÉLÈGUE la compilation à l'instance
//                                   (le constructeur ne parse pas).
//    inst.build(tk)             → parse SA valeur depuis le flux
//    inst.get()                → valeur runtime (ctx = le PORTEUR : var de key
//                                   / de Pièce / de piste — décide résolution+transport)
//    inst.setValue(v)             → reçoit une affectation (le type traite)
//    inst.debuild(ctx)          → ré-émission source, ÉCRITE dans ctx.dt (accès aveugle, valeur SANS clôture)
//
//  Path RETOURNE TOUJOURS UNE PIÈCE (this / $parent / ; / cible.x → une seule classe).
//  Script.get() = S'INCRUSTE (la macro fond ICI ; genre lu au 1er token du corps).
//
//  ⚠ FONDATION — les 3 littéraux (Number/String/PcOffset) sont pleins ; Func/Script/
//  Path ont build()+debuild() réels et get() PLANIFIÉS (stubs marqués).
//  RIEN n'est encore câblé au parser/runtime.
// ═══════════════════════════════════════════════════════════════════════════

class TsiVal {
  static isTsiValue = true;
  //  ═══ BALAYAGE DES COMPOSANTS — chaque classe déclare SES porteurs ═══════════
  //  Contrat UNIQUE et AVEUGLE, même principe que `debuild` : l'appelant ne sait
  //  pas ce qu'il traverse, chaque composant visite ce qu'il porte et délègue plus
  //  bas. Ajouter un porteur = une ligne DANS sa classe, à côté de sa déclaration
  //  au ctor — la description ne peut plus diverger de ce qu'elle décrit.
  //  Une valeur SIMPLE est une feuille : elle ne porte rien. Seules celles qui
  //  CONTIENNENT surchargent (TsiValArray : ses cellules — un bloc d'action dans un
  //  tuple `$fn(1), 200` y était INVISIBLE, mesuré 21/08).
  messageComponents(_onComp) {}
  //  « CETTE VALEUR PEUT-ELLE ARRÊTER LE PLATEAU ? » — lue par la prévision de
  //  bouclage (TsiTrackClock.prevoirBouclage), qui décide AU DÉPART du tour quel
  //  canal aura le droit de le clore. Une valeur simple n'arrête rien ; seuls les
  //  BLOCS répondent, en lisant leur source.
  contientStop() { return false; }
  //  CLÔTURES D'UNE VALEUR — DEUX FAMILLES DE CALLBACKS, portées par le CONTEXTE
  //  (c'est son rôle : l'environnement du traitement, construit par l'appelant
  //  du SITE — table des clôtures PD) :
  //     ctx.endIn   clôtures INTERNES — le token appartient à l'unité : CONSOMMÉ
  //                 par la fabrique avant de rendre (ex. `)` des arguments) ;
  //     ctx.endOut  clôtures EXTERNES — le token appartient à l'étage au-dessus :
  //                 JAMAIS consommé (ex. `;` `<` `&…` d'une valeur de key).
  //  Deux invariants HORS familles : END termine toujours (externe par nature) ;
  //  un token STRING est une DONNÉE, jamais une clôture (le corps backtick d'une
  //  track-macro COMMENCE par `&` sans être une piste suivante).
  //  Entre crochets, la clôture devient LOCALEMENT interne : `]` appartient au
  //  tableau — les familles du site sont masquées le temps du crochet.
  //  Rend : 'in' (à consommer) · 'out' (à laisser) · false (pas une fin).
  /** La fin d'une CELLULE de collection : la virgule ou le crochet, que la cellule ne consomme pas (10/09). */
  static _finCellule = t => t.val === ',' || t.val === ']';
  static _atEnd(t, ctx, bracket = false) {
    if (t === TsiTokenizer.END) return 'out';
    if (t.type === 'string')    return false;
    if (bracket) return t.val === ']' ? 'in' : false;
    if (ctx.endIn  && ctx.endIn(t))  return 'in';
    if (ctx.endOut && ctx.endOut(t)) return 'out';
    return false;
  }
  //  Le même test en OUI/NON — pour les PRÉ-TESTS des sites (ex. buildKeys).
  static isEnd(t, ctx) { return TsiVal._atEnd(t, ctx) !== false; }

  //  DEUX LECTEURS DE TEXTE déménagés de TsiCompiler, enterré (E-1c, 29/09) : leurs seuls clients sont ici.
  /** Valeur BRUTE d'une prop CSS GÉNÉRIQUE : tout jusqu'au terminateur (';', '<',
   *  balise, ou piste suivante '&'), ESPACES ET VIRGULES COMPRIS — une valeur CSS
   *  (box-shadow, transform, gradient) est un TEXTE, pas un tuple. `_value` (le
   *  découpeur) réserve espace/virgule aux tuples des props MODÉLISÉES ; ici on ne
   *  découpe rien. Round-trip : l'export ré-émet ce texte tel quel, la relecture le
   *  reprend jusqu'au ';' → pas de guillemets nécessaires. */
  static _valueRaw(tk) {
    const first = tk.peek(true);
    if (first === TsiTokenizer.END) return TsiNodeBuilder._EMPTY;
    const start = first.pos;
    let endPos = tk.tokens[tk.length]?.pos ?? tk.str.length;   // la borne du site (fenêtre V-1) : le jeton à tk.length se lit END, sa position reste la fin
    while (true) {
      const t = tk.peek(true);
      if (t === TsiTokenizer.END) break;
      if (t.val === ';' || t.val === '<' || t.type === 'mark' || TsiTokenizer.isAmp(t)) { endPos = t.pos; break; }   // 'mark' : ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)
      tk.next();
    }
    const raw = tk.str.slice(start, endPos).trim();
    return raw === '' ? TsiNodeBuilder._EMPTY : raw;
  }
  /** Valeur TEXTE d'une variable (bareword) ou CORPS de macro-script : `\n`
   *  littéral → saut de ligne ; sauts de ligne réels → newline avec trim() par
   *  ligne (l'indentation de continuation est retirée). Pour un corps de script,
   *  `\n`→newline évite que le `\` atteigne le tokenizer DSL ; le trim est sans
   *  effet (la grammaire ignore l'espace). */
  static _normText(s) {
    return s.split(/\r?\n/).map(l => l.trim()).join('\n').replace(/\\n/g, '\n');
  }
  //  ═══ LE PARSEUR TEXTE (chantier JS_Script) ═══════════════════════════
  //  L'AIGUILLAGE — la fonction AMONT de buildScript. Spec : « L'ORDRE DES TESTS »
  //  (règles fondamentales en tête de JS_Script.md). Les CLÔTURES viennent du ctx
  //  (ctx.endIn/endOut — service _atEnd, table des clôtures PD) : le site a déjà
  //  construit son environnement, rien ne passe en paramètre.
  //  ÉTAPE 1 : branches vivantes = 1-CSS (le ctx le dit), 2-littéral, 3-ACCOLADE.
  //  Les branches à venir RENVOIENT à l'ancien mécanisme, remplacées étape par étape.
  static aiguillage(tk, piece, ctx) {
    //  1 — valeur CSS : le ctx le DIT (isPureCss) — vérifiée ICI même si l'amont l'écarte.
    if (ctx.isPureCss) return TsiVal._buildClass(tk, piece, ctx);       // → TsiValPureCss
    //  LA FIN — la marche : saut de groupe en groupe (posPair), _atEnd répond au
    //  niveau 0. Fin EXCLUSIVE : `fin` désigne le token de clôture du site.
    const debut = tk.current;
    let fin = tk.searchLevel(t => TsiVal._atEnd(t, ctx) !== false, debut);   // au niveau 0, curseur immobile (2 ter)
    if (fin < 0) fin = tk.length;                                              // hors tableau = END : une valeur peut finir le flux
    const e = TsiVal._atEnd(tk.tokens[fin] ?? TsiTokenizer.END, ctx);
    const t0 = tk.tokens[debut];
    //  2 — LITTÉRAL : UN token string à apostrophes — sa forme le classe avant examen.
    if (fin - debut === 1 && t0.type === 'string' && t0.quote === "'")
      return TsiVal._buildClass(tk, piece, ctx);                        // → TsiValString (TsiValueSimple à terme)
    //  3 — ACCOLADE : l'habit couvre TOUT le corps — l'aiguillage le retire.
    if (t0.type === 'block' && t0.val === '{' && t0.posPair === fin - 1) {
      const js = new TsiJs(piece, ctx);
      js.buildScript(tk, debut + 1, t0.posPair);          // bornes INTÉRIEURES ; la règle décide du return (2 bis)
      js.src = '{' + js.src + '}';                        // celui qui retire RHABILLE : l'export ré-émet le bloc tel qu'écrit
      tk.current = Math.min(fin, tk.tokens.length);       // posé sur la clôture…
      if (e === 'in') tk.next();                          // …'in' : à l'unité ; 'out' : au site
      return js;
    }
    //  LA DÉCLARATION DE FONCTION en position de valeur — `$fc := function $nom(…){…}` :
    //  le geste a lieu AU BUILD (TsiValFuncDeclar lit, compile, DÉPOSE sur la Pièce) ;
    //  la valeur n'est qu'un VÉHICULE — action vide, src = la déclaration mot pour
    //  mot, ré-émise telle quelle à l'export.
    if (t0.type === 'ident' && t0.val === 'function' && tk.tokens[debut + 1]?.type === 'var') {
      const js = new TsiJs(piece, ctx);
      tk.current = debut;
      TsiValFuncDeclar.build(tk, piece);                //  avance tk jusqu'après le '}'
      const last = tk.tokens[tk.current - 1];
      js.src = tk.str.slice(t0.pos, last.pos + String(last.val).length);
      js._fn = () => undefined;                          //  le véhicule ne tire rien
      return js;
    }
    //  LA VALEUR NOMMÉE — `ident :: …` : STRUCTURELLE, avant le test du sigil (le
    //  calcul éventuel vit DANS sa valeur, confiné par sa cellule — récursion).
    if (t0.type === 'ident' && tk.tokens[debut + 1]?.val === '::')
      return TsiVal._buildClass(tk, piece, ctx);
    //  3 — LA COLLECTION `[…]` : des CELLULES, avant le test du sigil — chacune une valeur à part entière : la variable
    //  seule reste un lecteur, l'accolade un script. Compilée d'un bloc en expression JS, une accolade dans un tableau
    //  serait un objet (passe 7, 10/09 : `&size [{$r*2},{$r*2}]` — les six T1 tombaient dessus).
    if (t0.type === 'punct' && t0.val === '[' && t0.posPair === fin - 1) return TsiVal._buildClass(tk, piece, ctx);
    //  3 — LA FORMULE NUE — un appel, une chaîne d'accès ou un opérateur hors accolades : refusée. « Tispi ne traite pas
    //  les formules, Tispi ne réinvente pas la roue » (PD 10/09) : toute formule impose un script, `{$x+10}`. Le sigil
    //  seul, `$x`, reste un lecteur ; `$x, 200` un tuple de lecteur et de valeur. L'opérateur ne fait pas de token :
    //  `_resteAbandonne` le voit dans le texte — sans elle, `-$r` nu se lirait `$r` en silence.
    const t1 = fin - debut > 1 ? tk.tokens[debut + 1] : null;
    const appel = t0.type === 'ident' && t1?.type === 'block' && t1.val === '(';
    const acces = t0.type === 'ident' && t1?.val === '.';
    if (appel || acces || TsiVal._resteAbandonne(tk, debut, fin))
      throw new Error(TsiTokenizer.posError(tk.str, t0.pos, `une formule s'écrit entre accolades : { … } — Tispi ne traite pas les formules`));
    //  4 — SINON : la famille TsiValueSimple — le lecteur, la valeur simple, la collection ou le tuple de ceux-là.
    return TsiVal._buildClass(tk, piece, ctx);
  }
  //  L'OPÉRATEUR RESTANT — test TEXTUEL (spec : ils n'existent pas dans le flux).
  //  Le tokenizer CONSOMME ET ABANDONNE les opérateurs (cat. 4 : + * / %…) et IGNORE
  //  l'inconnu (cat. 0 : ? ! ^…) — aucun ne laisse de token. Un caractère NON BLANC
  //  du corps couvert par AUCUN token est donc un signe de calcul. Les désamorçages
  //  sont gratuits ici : -24 vit DANS son token number, 50%10 DANS son pcOffset.
  //  Depuis la règle des formules (PD 10/09), ce signe hors accolades est une FAUTE, plus un script. Le corps s'examine
  //  depuis le REPÈRE qui précède (tokens + substring, 2 ter), pas depuis son premier token : `-$r` porte son moins AVANT `$r`.
  static _resteAbandonne(tk, debut, fin) {
    const t0 = tk.tokens[debut], prec = tk.tokens[debut - 1];
    let pos = !prec ? 0 : prec.type !== 'string' && prec.type !== 'pcOffset' ? prec.pos + TsiVal._lenSource(prec, tk.str) : t0.pos;   // curseur SOURCE, depuis le repère — null = zone non mesurable
    for (let i = debut; i < fin; i++) {
      const t = tk.tokens[i];
      if (pos != null && /\S/.test(tk.str.slice(pos, t.pos))) return true;   // un trou non blanc
      if (t.type === 'block' && t.val === '{' && t.posPair != null) {        // un script en cellule : son corps est du JS — rien à y chercher (V-3)
        pos = tk.tokens[t.posPair].pos + 1; i = t.posPair; continue;
      }
      const len = TsiVal._lenSource(t, tk.str);
      pos = len == null ? null : t.pos + len;
    }
    return pos != null && /\S/.test(tk.str.slice(pos, tk.tokens[fin]?.pos ?? tk.str.length));  // le trou final (fin absente = fin de flux)
  }
  //  La LONGUEUR SOURCE d'un token — le tokenizer ne la stocke pas.
  static _lenSource(t, str) {
    switch (t.type) {
      case 'string':   return t.val.length + (t.quote ? 2 : 0);   // sans quote = nombre+unité, val EST la source
      case 'number': {                                            // val = Number(val) — se RE-MESURE (1.50 → 1.5)
        return /^-?[0-9]+(\.[0-9]*)?/.exec(str.slice(t.pos, t.pos + 32))[0].length;
      }
      case 'pcOffset': return null;                               // val = [pc, off] — non dérivable, zone indulgente
      default:         return String(t.val).length;               // ident/var/attr/punct/block
    }
  }
  static _isAttr(t) { return t.type === 'attr' && t.val.startsWith('$$'); }
  /**
   * @references
   *  {@link TsiNodeBuilder.buildKeys()}
   *  {@link TsiDecompiler._applyDataTsi()}
   *  {@link TsiVal._buildClass()}
   *  
   * @param {TsiTokenizer} tk 
   * @param {TsiPiece} piece 
   * @param {Object} ctx 
   * @returns {TsiValArray|null}
   */
  static buildClass(tk, piece, ctx) {
    //  ⚠ BASCULEMENT (chantier JS_Script, PD 26/08) : TOUS les sites de valeur
    //  (keys de piste, décompilateur) passent par l'AIGUILLAGE — le parsing est le
    //  même partout, seule la clôture varie (elle vient du ctx du site). La famille
    //  qui ne calcule pas retombe dans l'ancien dispatch, inchangée.
    const inst = TsiVal.aiguillage(tk, piece, ctx);
    const t = tk.peek(true);                               // RE-PEEK après compilation (t était le 1er token de la cellule ; tk a avancé)
    if(ctx.situation === TsiVar.HEADER && t.val===';'){    // consomme le ';' SEULEMENT en HEADER ; en VALUE il est à la key (_track), en TRACKS au track
      tk.next();
    }
    return inst;
  }



  //########################################################################################################################
  //########################################################################################################################
  //########################################################################################################################
  //########################################################################################################################
  // FABRIQUE — le SEUL point de dispatch (parsing = construction). Les clôtures
  // viennent du CONTEXTE (ctx.endIn / ctx.endOut — cf. _atEnd) : le site les a
  // posées à la construction de son ctx, la récursion les transmet avec lui.
  /**
   * Construction d'une valeur de variable (TsiVal) depuis le flux de tokens.
   *  Le flux est lu jusqu'à la fin de valeur (clôture interne ou externe, ou fin de
   *  flux). La valeur peut être :
   *    - simple (TsiValConst, TsiJs, TsiValFuncDeclar) ;
   *    - tableau (TsiValArray) : crochets `[...]` ou tuple `a, b` (virgules).
   *  Le flux est avancé jusqu'au token APRÈS la valeur (clôture consommée si interne,
   *  laissée si externe).
   * @reference 
   *   {@link TsiVal.buildClass()}
   *   {@link TsiVar._buildClass()}
   *   {@link TsiValString.build()}
   *   {@link TsiAttrsBuilder.buildEntree()}
   * @param {TsiTokenizer} tk 
   * @param {TsiPiece} piece 
   * @param {Object} ctx 
   * @returns {TsiValArray|null}
   */
  static _buildClass(tk, piece, ctx) {
    let t = tk.peek(true), array = null, bracket = false;
                                                       //________________________________________________________________________________
                                                       // '[...]' = tableau (crochets) ; ',' = tuple (virgules) ; ni l'un ni l'autre = valeur simple]
    //  '[' est le crochet de TOUTE la valeur si son ']' la termine (V-2, 01/10) ; sinon c'est une CELLULE — `[1,2],200` est un tuple
    if (t.val === '[' && t.posPair === tk.length - 1) { tk.next(); array = []; bracket = true; t = tk.peek(true); }   // '[' FORCE le tableau (le ']' le clôt) ; un tuple nu `a, b` s'en passe
    let e = TsiVal._atEnd(t, ctx, bracket);
    if (e) {
      if (e === 'in') tk.next();                       // clôture INTERNE consommée (`]` d'un tableau vide, `)` d'arguments vides)
      return array ? new TsiValArray(piece, ctx, array)   // `[]` = tableau vide
                   : null;                             // emplacement vide, pas de valeur
    }
    let inst;
    do {
      // une CELLULE : variable ($nom) ou valeur simple. 
      // (Les props CSS génériques sont
      // traitées AVANT, au niveau de _track via _valueRaw — pas ici.)
      //  (l'encapsulation en TsiJs — paths, appels, déclarations — vit désormais
      //   dans l'AIGUILLAGE, en AMONT : ici n'arrivent que les cellules-données.)
      if (t.val === '[') {                             // une COLLECTION en cellule (V-2) : bornée à son ']', lue par ce lecteur même
        const len = tk.length; tk.length = t.posPair + 1;
        try { inst = TsiVal._buildClass(tk, piece, ctx); } finally { tk.length = len; }
      } else
      inst = t.type === 'var'                    ? TsiVar._buildClass(tk, piece, ctx)
           : t.type === 'block' && t.val === '{' ? TsiVal.aiguillage(tk, piece, { ...ctx, endIn: null, endOut: TsiVal._finCellule })   // un script dans une cellule (10/09)
           :                                       TsiVal.buildValueSimple(tk, piece, ctx);
      t = tk.peek(true);                               // RE-PEEK après compilation (t était le 1er token de la cellule ; tk a avancé)
      e = TsiVal._atEnd(t, ctx, bracket);
      if (e) {                                         // fin de valeur / de key
        if (e === 'in') tk.next();                     // clôture INTERNE consommée : elle appartient à la valeur
        if (array == null) return inst;                // valeur SIMPLE (ni crochet ni virgule)
        array.push(inst);
        return new TsiValArray(piece, ctx, array);     // TABLEAU (crochets) / TUPLE (virgules)
      }
      (array ??= []).push(inst);
      if (t.val !== ',')                               // seul le ',' sépare les cellules — un reste de formule tombe ici (`[$r+10, …]`)
        throw new Error(TsiTokenizer.posError(tk.str, t.pos, `une formule s'écrit entre accolades : { … } — ici ',' ou ']' attendu`));
      tk.next();                                       // consomme la virgule
      t = tk.peek(true);                               // 1ᵉʳ token de la cellule suivante…
      e = TsiVal._atEnd(t, ctx, bracket);
      if (e) {                                         // … ou PAS de cellule suivante : la valeur s'arrête ici
        if (e === 'in') tk.next();                     // clôture INTERNE consommée
        return (array.length === 1 && !bracket) ? array[0]        // `a,` sans crochets = la valeur simple `a`
                                                : new TsiValArray(piece, ctx, array);
      }
    } while (true);
  }
  /**
   * 
   * @param {TsiTokenizer} tk 
   * @param {TsiPiece} piece 
   * @param {TsiContext} ctx 
   * @returns {TsiVal}
   */
  static buildValueSimple(tk, piece, ctx) {
    const t  = tk.peek(true);
    if (t === TsiTokenizer.END) throw new Error(TsiTokenizer.posError(tk.str, tk.str.length, `valeur : fin de flux inattendue`));
    const nv = (() => { const n = tk.peekNext(true); return n === TsiTokenizer.END ? null : n.val; })();
    let inst;
    //  CSS générique : une chaîne quotée SEULE est un TEXTE — grammaire IA `0:'rgba(…)'`, la valeur nue, sans apostrophes ;
    //  tout autre corps est du CSS brut lu jusqu'au terminateur — forme moteur `0:rgba(…)`, `1px solid red` (étape 3, 08/09).
    const seul = nv === null || nv === ';' || nv === '<' || nv === ',' || nv === ']' || nv === ')' || (typeof nv === 'string' && nv[0] === '&');
    if (ctx.isPureCss && t.type === 'string' && t.quote !== '`' && seul) inst = new TsiValText(piece, ctx);
    else if (ctx.isPureCss){  inst = new TsiValPureCss(piece, ctx); }  // valeur CSS générique (non modélisée) : lit tout jusqu'au ';' (espaces/virgules gardés)
    //  (le bloc `{…}` est capté par l'AIGUILLAGE en amont — plus de branche ici.)
    else if (t.type === 'ident' && nv === '::')        inst = new TsiValNamed(piece, ctx);  // ident :: valeur — la valeur nommée
    else if (t.val === 'true'  && t.type === 'ident')  inst = TSI_TRUE;
    else if (t.val === 'false' && t.type === 'ident')  inst = TSI_FALSE;
    else if (t.val === 'null'  && t.type === 'ident')  inst = TSI_NULL;                    // le nom système `null` (grammaire IA, 25e)
    else if (t.val === 'this'  && t.type === 'ident')  inst = new TsiValThis(piece, ctx);  // `$nom = this;` — l'élément courant (PD 07/09)
    // (une action s'écrit entre accolades, quelle que soit sa langue — un seul signe pour un seul rôle.
    //  Le test est monté DANS la branche '{' ci-dessus : il n'a plus de sens ailleurs.)
    else if (t.type === 'string' && t.quote === '`'){ 
      const carStart = t.val.trim().charAt(0);
      switch(carStart){
        case '&':
        case ':':
          inst = new TsiValMacro(piece, ctx);
          break;
        case '<':
          if (/^\s*<script/i.test(t.val)) inst = new TsiValUserJs(piece, ctx);
          break;
        case '{':
          inst = new TsiValMacroAction(piece, ctx);
          break;
      }
    }
    else if (t.type === 'string')                     inst = new TsiValText(piece, ctx);    // 'texte' — UN token, quote MÉMORISÉE et ré-émise (étape 3)
    else if (t.type === 'pcOffset')                   inst = new TsiValPcOffset(piece, ctx);  // 50%10
    else if (t.type === 'number')                     inst = new TsiValNumber(piece, ctx);    //  42
    //  (`name(…)` est capté par l'AIGUILLAGE — appel JS natif ou fonction $sigil.)
    else                                              inst = new TsiValString(piece, ctx);    // bareword

    inst.build(tk);                                            // le constructeur ne build PAS
    return inst;
  }
  
  // source depuis le curseur jusqu'à ';' / '&piste' / fin (exclus)
  static _sliceToTerm(tk) {
    const start = tk.peek(true).pos;
    let t;
    while ((t = tk.peek(true)) !== TsiTokenizer.END && t.val !== ';' && !TsiTokenizer.isAmp(t)) tk.next();
    const end = (t === TsiTokenizer.END) ? tk.str.length : t.pos;
    return tk.str.slice(start, end).trim();
  }

  // ident '(' … ')' à parenthèses ÉQUILIBRÉES → src brute "fc(...)". S'arrête APRÈS le ')' final
  // (≠ _sliceToTerm qui file jusqu'à ';' → sur-lirait la suite du path). Seules les parens 'block' comptent.
  static _sliceBalanced(tk) {
    const start = tk.peek(true).pos;
    tk.next();                                          // l'ident (nom de fonction)
    if (tk.peek(true).val !== '(') throw new Error("appel de fonction : '(' attendu après le nom");
    let depth = 0, close = null;
    do {
      const t = tk.peek(true);
      if (t === TsiTokenizer.END) throw new Error("appel de fonction : ')' manquant (parenthèses non équilibrées)");
      if (t.type === 'block' && t.val === '(') depth++;
      else if (t.type === 'block' && t.val === ')') { depth--; close = t; }
      tk.next();
    } while (depth > 0);
    return tk.str.slice(start, close.pos + 1);          // du nom jusqu'au ')' final inclus
  }
  constructor(piece, ctx) { 
    this.piecePt = piece?.idUnic ?? null;   // `?.` : les SINGLETONS (TSI_TRUE, TSI_FALSE…) naissent SANS Pièce
    this.situation = ctx.situation; 
  }  // ⚠ SEAM registre ; ctx = OBJET { situation (HEADER/TRACKS/VALUE), isPureCss, … } — le CONTENANT viendra plus tard (placement à la création de Pièce)
  build(_tk)  {}                     // parse SA valeur (surchargé)
  get()     { return undefined; }  // valeur runtime
  setValue(_v)  {}                     // reçoit une affectation
  findVar(_nom) { return null; }       // scan Pièce : rien (surchargé par conteneurs/vars)
  debuild(_ctx) { }                  // ré-émission source : chaque héritier ÉCRIT la sienne (ctx.dt)
}

// ── LITTÉRAUX (transportent en CSS) ──────────────────────────────────────────

class TsiValNumber extends TsiVal {              // := 42
  constructor(piece, ctx) { super(piece, ctx); }
  build(tk)  { this.n = Number(tk.next().val); }     // consomme le token nombre → this.n (miroir de PcOffset)
  get()        { return this.n; }
  setValue(v)  { this.n = Number(v); }
  debuild(ctx)  { ctx.dt += this.n; }
}
class TsiValTrue extends TsiVal {              // := true
  constructor(piece, ctx) { 
    super(piece, ctx);
  }
  build(tk)  { if(tk.next().val !== "true") throw new Error("token true attendu"); }     // consomme le token true → this.n (miroir de PcOffset)
  get()        { return true; }
  setValue(v)  {  }
  debuild(ctx)  { ctx.dt += "true"; }
}
const TSI_TRUE = new TsiValTrue(null, { situation: null });   // SINGLETON — jamais de `new` chez les clients : TSI_TRUE
class TsiValFalse extends TsiVal {              // := false
  constructor(piece, ctx) { 
    super(piece, ctx);

  }
  build(tk)  { if(tk.next().val !== "false") throw new Error("token false attendu"); }     // consomme le token false → this.n (miroir de PcOffset)
  get()        { return false; }
  setValue(v)  {  }
  debuild(ctx)  { ctx.dt += "false"; }
}
const TSI_FALSE = new TsiValFalse(null, { situation: null });   // SINGLETON — jamais de `new` chez les clients : TSI_FALSE
class TsiValNull extends TsiVal {              // = null  — le nom système : l'absence de valeur (grammaire IA ; `let $monde = null;`)
  build(tk)  { if (tk.next().val !== 'null') throw new Error('token null attendu'); }
  get()        { return null; }
  setValue(_v) { }
  debuild(ctx)  { ctx.dt += 'null'; }
}
const TSI_NULL = new TsiValNull(null, { situation: null });    // SINGLETON — comme TSI_TRUE
class TsiValThis extends TsiVal {              // = this  — l'ÉLÉMENT courant, par son POINTEUR (jamais de référence vive)
  build(tk)  { if (tk.next().val !== 'this') throw new Error('token this attendu'); }
  get()        { return this.piecePt?.get(() => { this.piecePt = null; }); }   // le pointeur EXIGE son callback de lien mort (TsiIdUnic.get) — 6.4
  setValue(_v) { }
  debuild(ctx)  { ctx.dt += 'this'; }
}

// ── LE STOP D'HORLOGE : `&clock … 20:stop;` ─────────────────────────────────
//  Valeur PROPRE, distincte de `true` — pour qu'elle puisse évoluer sans suivre
//  les booléens (décision PD 2026-08-13).
//
//  DEUX ÉCRITURES D'ENTRÉE, UNE DE SORTIE — même doctrine que les attributs :
//  on écrit à la main, la machine compresse. L'auteur écrit `stop` (lisible) ou
//  `1` ; le debuild rend TOUJOURS `1` (compact) — `0:1; 20:1; 300:1;` plutôt que
//  la répétition du mot.
//
//  LE TEST EST UNE IDENTITÉ, PAS UNE VALEUR : `key.value === TSI_STOP`. Le
//  singleton EST le marqueur ; `get()` n'est que sa charge utile. D'où la
//  disparition de l'ancien `TsiKeyClock.STOP = 1`, nombre magique qu'un
//  commentaire signalait lui-même comme confondable avec une frame.
class TsiValStop extends TsiVal {              // := stop | 1   (piste &clock)
  build(tk)   { tk.next(); }                   // le mot `stop` ou le chiffre `1`
  get()       { return 1; }                    // la valeur
  setValue(v) { }
  debuild(ctx)   { ctx.dt += "1"; }            // forme COMPACTE
}
const TSI_STOP = new TsiValStop(null, { situation: null });    // SINGLETON — identité

class TsiValArray extends TsiVal {              // := 42
  constructor(piece, ctx, array) { super(piece, ctx); this.array = array ?? []; }
  get(cur)     { return this.array.map(c => c.get(cur)); }   // tuple → tableau des VALEURS résolues (cur threadé pour paths/fn)
  setValue(v)  { this.array = Array.isArray(v) ? v : [v]; } // TODO à vérifier
  findVar(nom) { for (const c of this.array) { const r = c.findVar(nom); if (r) return r; } return null; }   // descend dans les cellules
  //  MES PORTEURS : les cellules — chacune est une valeur à part entière (un bloc
  //  d'action peut s'y trouver : `&pos 0: $fn(1), 200;`).
  messageComponents(onComp) {
    for (const c of this.array) {
      const r = onComp(c, 'value'); if (r && r !== 'continue') return r;
      const w = c.messageComponents(onComp); if (w) return w;
    }
  }
  //  Liste de type ARRAY (table des clôtures PD) : le séparateur `, ` appartient au
  //  CONTENANT — n−1 séparateurs, rien avant la première cellule. Les crochets
  //  restent au SITE d'emploi (valeur d'attribut) : un tuple de key s'écrit nu.
  debuild(ctx)  { const a = this.array;
                  for (let i = 0; i < a.length; i++) { if (i) ctx.dt += ', '; a[i].debuild(ctx); } }
}

// ── VALEUR DÉJÀ ÉVALUÉE : défaut de pseudo-key, lecture DOM figée (frozen), valeur
// courante d'un goto. Le cas de base de la réif — une valeur qui se retourne elle-même —
// pour que value.get() soit universel, même sur les bruts jamais passés par le compilateur.
// Autonome (ni pièce ni ctx : jamais compilé/exporté) : accédé par le seul get().
class TsiValConst {
  static isTsiValue = true;
  constructor(v) { this.v = v; }
  get()          { return this.v; }
  debuild(ctx)    { ctx.dt += this.v; }     // ~jamais appelé (non exporté)
}

// ── CSS PUR : valeur CSS BRUTE (box-shadow, transform, gradient…) — script CSS non découpé ─
class TsiValPureCss extends TsiVal {
  constructor(piece, ctx) { super(piece, ctx); }
  build(tk) { this.src = TsiVal._valueRaw(tk); }   // texte brut jusqu'au terminateur (';'/'<'/'&' ; 'mark' ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark))
  get()       { return this.src; }                        // le script CSS tel quel (aucune résolution)
  debuild(ctx) { ctx.dt += this.src; }                  // verbatim → round-trip sans guillemets
}

class TsiValString extends TsiVal {              // := bareword (texte, ; interne échappé côté source)
  // bareword = tokens jusqu'à ';' / ',' / ')' / '&piste' / fin, joints (position-indépendant).
  constructor(piece, ctx) { super(piece, ctx); }
  build(tk) {
    const parts = [];
    
    while (true) {
      const t = tk.peek(true);
      if (t === TsiTokenizer.END || t.val === ';' || t.val === ')' || t.val === ']' || t.val === '}' || t.val === ',' || TsiTokenizer.isAmp(t)) break;   // ')' = fin d'args ; ']' = fin de tableau ; ',' = séparateur de tuple (une string multi-token s'arrête à la cellule)
      parts.push(String(tk.next().val));
    }
    this.s = parts.join(' ').trim();
  }
  get()        { return this.s; }
  setValue(v)  { this.s = String(v); }
  debuild(ctx)  { ctx.dt += this.s; }
}

// ── TEXTE QUOTÉ : 'texte' / "texte" — UN token, la quote MÉMORISÉE et ré-émise, l'apostrophe intérieure doublée ─
//  Grammaire IA : un texte est toujours quoté (le mot nu est un NOM, résolu par son consommateur — TsiValString) ;
//  forme moteur : le mot nu reste lu. Le round-trip est FIDÈLE à l'écriture (PD 08/09 : « quoté dans l'export IA,
//  pas dans le moteur ») — la vérification « texte nu » en profil IA appartient au validateur (étape 7).
class TsiValText extends TsiValString {
  build(tk)     { const t = tk.next(true); this.s = String(t.val); this.quote = t.quote ?? "'"; }
  debuild(ctx)   { const q = this.quote; ctx.dt += q + this.s.split(q).join(q + q) + q; }
}

// ── LA VALEUR NOMMÉE : ident :: valeur  (PD 2026-08-27) ──────────────────────
//  La paire (nom, valeur) en citoyen AUTONOME — le tableau nommé reconstruit à
//  partir de valeurs libres : isolée, ou en cellule de tuple, cherchable par nom.
//  `get()` rend LE NOM — la face cherchable ; `getValue()` livre le contenu, qui
//  n'a PAS été tiré : une action `{…}` y arrive VIVANTE (le différé sans callback).
//  Le nom est une DONNÉE PAR LE SIGNE — ident nu, jamais de guillemets : la valeur
//  est simple, les signes de string sont inutiles (PD).
//  La valeur s'arrête à la VIRGULE de niveau 0 (la cellule) : un tuple en valeur
//  s'écrit entre crochets — `nom :: [10,20]`.
class TsiValNamed extends TsiVal {
  constructor(piece, ctx) { super(piece, ctx); this._node = piece; this._ctx = ctx; this.s = null; this.value = null; }
  build(tk) {
    this.s = tk.next().val;                            //  le NOM — ident nu
    tk.next();                                         //  '::'
    //  LA VALEUR — l'aiguillage complet (simple OU action), borné à la CELLULE :
    //  la virgule de niveau 0 rejoint les clôtures du site.
    const ctxCell = { ...this._ctx, endOut: t => t.val === ',' || t.val === ']' || !!this._ctx.endOut?.(t) };   //  ']' : la nommée en TABLEAU rend la main au crochet
    this.value = TsiVal.aiguillage(tk, this._node, ctxCell);
  }
  get()        { return this.s; }                      //  la face CHERCHABLE
  //  LE DÉCLENCHEMENT EST ICI (PD) : la value ne s'exécute qu'à l'appel de
  //  getValue() — jamais avant, jamais ailleurs. Le résultat remonte ; le ctx est
  //  celui de la capsule (TsiJs.get sans self : SA Pièce, résolue par pointeur).
  getValue()   { return this.value.get(); }
  setValue(v)  { this.value = v; }
  findVar(nom) { return this.value?.findVar?.(nom) ?? null; }
  debuild(ctx) { ctx.dt += this.s + ' :: '; this.value?.debuild(ctx); }
}
//  (TsiValFuncOn — SUPPRIMÉE à la coupe du 2026-08-26 : le parseur texte la remplace.)

class TsiJs extends TsiVal {             // := { action; action; … }  — bloc d'actions RÉIFIÉES
  /** Les mots qui ouvrent une INSTRUCTION, jamais une expression : devant eux, pas de `return` posé (2 bis). */
  static INSTRUCTIONS = new Set(['return', 'const', 'let', 'var', 'if', 'for', 'while', 'do', 'switch', 'throw', 'try', 'function', 'class', 'break', 'continue', 'debugger']);
  /** UNE SEULE INSTRUCTION ? Lue sur les REPÈRES de niveau 0 (PD 10/09) : aucun ';', ou un seul qui COLLE la fin. Jamais
   *  devant un mot d'instruction (`if`, `const`, `return`…), jamais dans un corps de fonction (`params`). Rend l'index où
   *  l'instruction s'arrête — le ';' final exclu —, ou -1 si le corps n'est pas une instruction seule. */
  static _instructionSeule(tk, debut, fin, params) {
    if (params || fin <= debut) return -1;
    const t0 = tk.tokens[debut];
    if (t0.type === 'ident' && TsiJs.INSTRUCTIONS.has(t0.val)) return -1;
    const pv = tk.searchLevel(';', debut, fin);            // le premier ';' de niveau 0 — posPair franchit les blocs d'un saut
    if (pv < 0) return fin;                                // aucun : l'instruction va jusqu'au repère de fin
    return pv === fin - 1 ? pv : -1;                       // un seul, et il colle la fin : l'instruction s'arrête devant lui
  }
  /** INSCRIT 'return' devant une instruction seule, puis remet la substring transcrite entre le repère de tête (`posDeb`)
   *  et le ';' — la méthode de PD. Sinon, le corps transcrit tel quel : des instructions. */
  _avecReturn(tk, debut, fin, posDeb, params) {
    const finInstr = TsiJs._instructionSeule(tk, debut, fin, params);
    return finInstr < 0 ? this.transcrire(tk, debut, fin, posDeb)
                        : 'return ' + this.transcrire(tk, debut, finInstr, posDeb);
  }
  /** La tête d'un chemin portée par une variable (10/09) : un nœud Tispi, sinon une faute qui dit ce que la variable porte. */
  static tete(v, nom) {
    if (v?.isPiece) return v;
    TsiError.error(`${nom}-> : la tête d'un chemin doit être un nœud Tispi — ${nom} porte ${v == null ? String(v) : typeof v === 'object' ? 'un ' + (v.constructor?.name ?? 'objet') : 'un ' + typeof v}`);
  }
  //  ═══ LE SERVICE D'idUnic DES BLOCS D'ACTIONS ═══════════════════════════════
  //  Un registre à elles, comme piecesPt l'est aux Pièces. Une TsiJs naît
  //  au BUILD et ne bouge plus : son identité est donc STABLE pour toute la vie
  //  de la page — c'est ce qui la rend utilisable comme REPÈRE.
  //  À quoi il sert : `&onTime 0:{ on(…) }` se rejoue à CHAQUE passage sur la
  //  frame 0 (boucle, gotoStop, rejeu). Le repère permet de reconnaître que c'est
  //  LE MÊME appel qui revient, et de ne pas réinitialiser un abonnement en cours.
  //  Un autre appel, lui, porte un autre idUnic : il prend la place.
  //
  //  ⚠ TODO — LES DEUX REGISTRES NE SE VIDENT JAMAIS (mesuré 17 puis 20/08).
  //  `put` inscrit à la naissance, et rien ne retire. `TsiNode.flush` descend le
  //  seul arbre DOM : il ignore l'arbre INTERNE (timeline → pistes → keys →
  //  valeurs). Restent donc inscrits, après le flush d'une branche :
  //    · les BLOCS D'ACTION, ici (actionsPt) — avec leur table `_t` et leur `_fn` ;
  //    · les PISTES, dans piecesPt (elles s'y inscrivent depuis le 20/08 — leur
  //      idUnic ancre les keys d'une vue compressée). Mesuré : ~4,6 inscrits par
  //      nœud sur une page de dix Pièces à quatre pistes.
  //  Et comme chaque piste porte `this.piece`, elle DÉSIGNE encore son nœud retiré :
  //  le flush ne libère donc rien du tout.
  //
  //  ÉCARTÉ, ne pas re-proposer :
  //    · balayer un registre en comparant les idUnic — « Tispi ne balaie JAMAIS les
  //      liens à la mort d'un composant » (TsiIdUnic.get), et il faudrait toute la
  //      page pour en retirer trois ;
  //    · faire fouiller `flush` — il devrait connaître les cachettes d'un bloc, or
  //      il y en a trois (valeur de key, déclaration de header, attribut) : prothèse
  //      de balayage ;
  //    · une cascade d'ATOMES écrits classe par classe (essayée puis annulée le
  //      20/08) — c'est refaire une SECONDE fois le travail du debuild, avec le
  //      risque que les deux divergent.
  //
  //  LA FORME RETENUE (PD 2026-08-20) — RÉUTILISER LE COUPLE EXISTANT :
  //      suppression → DEBUILD du composant → un script data-tsi mémorisé
  //      undo        → BUILD de ce script   → le composant renaît
  //  Le debuild EST déjà l'inverse du build, éprouvé, byte-exact, point fixe
  //  mesuré : un seul couple pour tous les étages (nœud, piste, key, variable),
  //  rien à maintenir en double.
  //  Reste à trancher avant d'écrire : (a) à QUOI le script se rattache au redo —
  //  comment le contenant est désigné ; (b) ce qui n'est PAS dans le data-tsi et se
  //  perd quand même — abonnements, face courante, position d'horloge : le script
  //  rend la STRUCTURE, pas l'état vivant.
  //  La cascade reste le PARCOURS (post-ordre, du plus profond vers le nœud — l'undo
  //  rejouant en sens inverse, le contenant renaît avant son contenu).
  //
  //  Sans conséquence en fonctionnement : le repère n'est JAMAIS résolu (il se
  //  compare par identité, TsiListeners.add) — la fuite ne se voit qu'en mémoire.
  static actionsPt = new TsiComposPt();

  constructor(piece, ctx) {
    super(piece, ctx); this._ctx = ctx;   //  la Pièce : par POINTEUR (piecePt hérité), jamais de référence vive
    this.idUnic = null;                                   // la FORME d'abord : put() exige le champ
    this.idUnic = TsiJs.actionsPt.put(this);       // put pose un TsiIdUnic {uid, pos, table} + inscrit
    //  Tous les champs sont posés ICI : la forme de l'objet est fixée à la
    //  naissance et ne change plus (condition de l'optimisation d'accès).
    this.src   = null;    // le bloc TEL QU'ÉCRIT — c'est lui que l'export ré-émet, et que lit contientStop
    this._t    = null;    // LA TABLE des objets Tispi — construits UNE fois, au build
    this._fn   = null;    // le corps compilé — (_ctx_, _t) => …
    this.scriptJs = null; // LE SCRIPT PRODUIT par le parseur texte (chantier JS_Script) — debug seul, cf. _keepJs()
    this.ctx      = null; // LE CONTEXTE réifié (classe À VENIR, PD 25/08) — fonctions d'accès aux éléments
                          // utiles ; son rapport à _ctx (le ctx de BUILD) se tranche quand la classe naîtra.
    //  ⚠ LA CAPSULE AUTONOME (PD 25/08) : TsiJs n'a qu'UN lien vers l'extérieur, sa
    //  POSITION D'ACCROCHE, mémorisée pour savoir s'en DÉCROCHER — au flush, la
    //  capsule se retirera ELLE-MÊME du registre actionsPt (réponse au TODO
    //  « les registres ne se vident jamais », mesuré 17-20/08). À concevoir.
    //  L'accroche est un idUnic — « un pointeur serait trop rigide » (PD) : celui de
    //  la VALUE de la key, de la VAR ou de l'ATTRIBUT ; dans un TABLEAU : l'idUnic du
    //  porteur + le NOM du champ qui contient le tableau + l'id de CASE par dimension.
    //  C'est ctx qui la portera, entre autres.
  }
  //  L'EXÉCUTION — deux références passées, rien à construire ni à chercher.
  //  Le corps peut faire `return` : sa valeur remonte (PD).
  //  self ABSENT (site d'accueil : déclaration, banc sans déclencheur) → TsiJs EST
  //  le déclencheur : il résout SA Pièce et construit le contexte minimal (PD 25/08 :
  //  le script reçoit la Pièce ELLE-MÊME, vivante, à toutes les étapes).
  //  self a TROIS formes (cf. exe) : un TsiCtx (actions) · un PORTEUR NU (valeurs de
  //  key : le script attend _ctx_.piece, on l'HABILLE) · absent (déclaration, banc).
  get(self) {
    const ctx = self == null                    ? new TsiCtx(this.getPiece(), null, null, 0, null)
              : (self.isPiece || self.div)      ? new TsiCtx(self, null, null, 0, null)
              : self;
    return this._fn(ctx, this._t);
  }
  //  LA PIÈCE — LE LIEN EST UN POINTEUR (piecePt, hérité de TsiVal), jamais une
  //  référence vive. Résolu à CHAQUE tir ; lien mort → le champ se vide.
  //  (⚠ this._node, la référence vive de l'ancien chemin, meurt à la coupe.)
  getPiece() { return this.piecePt?.get(() => { this.piecePt = null; }); }

  //  ═══ LE PARSEUR TEXTE (chantier JS_Script) — l'AIGUILLAGE vit sur TsiVal ═══
  //  buildScript — la construction TEXTE. Le corps arrive DÉJÀ BORNÉ par
  //  l'aiguillage (RÈGLE FONDAMENTALE) : AUCUNE clôture cherchée ici.
  //  [posTokenStart, posTokenEnd[ — fin EXCLUSIVE. UN SEUL TRAITEMENT pour tous les scripts (PD 10/09, 2 bis) : un corps
  //  d'UNE SEULE INSTRUCTION rend sa valeur — 'return ' est posé devant, par le texte — sauf s'il commence par un mot
  //  d'instruction (`if`, `const`, `return`…) ; plusieurs instructions, rien. Le drapeau `expr` est tombé : la règle décide.
  //  `params` : les paramètres d'une DÉCLARATION DE FONCTION. Sa présence (un tableau, fût-il vide) dit que le corps est
  //  un CORPS DE FONCTION — des statements, JAMAIS un return posé : `function $f(){ let a, b; }` est du JavaScript tel quel.
  buildScript(tk, posTokenStart, posTokenEnd, params = null) {
    const t0 = tk.tokens[posTokenStart], prec = tk.tokens[posTokenStart - 1];
    const posFin  = tk.tokens[posTokenEnd]?.pos ?? tk.str.length;   // le repère de FIN : '}' ou la clôture du site
    //  LE CORPS EST UNE SUBSTRING ENTRE DEUX REPÈRES (PD 10/09 : « le parser ne travaille jamais en tokens purs, mais en
    //  tokens + substring ») : il part juste après le repère qui précède — '{', '=', ':', '(' —, pas au premier token :
    //  `-` et `+` ne font pas de token, et `{-$r-2}` perdait son moins, du script et du src (2 ter). Blancs de tête sautés.
    let posDeb = !prec ? 0 : prec.type !== 'string' ? prec.pos + String(prec.val).length : t0.pos;   // rien devant : le début du texte est le repère
    while (posDeb < posFin && tk.str.charCodeAt(posDeb) <= 32) posDeb++;
    this.src      = tk.str.slice(posDeb, posFin);        // le CORPS tel qu'écrit, ';' final compris
    //  LE RETURN (PD 10/09) : une seule instruction rend sa valeur ; plusieurs, l'auteur écrit son return. La règle se lit
    //  sur les repères dans `TsiJs._instructionSeule`, l'inscription dans `_avecReturn`. Le script est du JavaScript tel
    //  qu'écrit — la virgule y est celle de JavaScript, plus un tuple : Tispi ne traite pas les formules.
    this.scriptJs = this._avecReturn(tk, posTokenStart, posTokenEnd, posDeb, params);
    try {
      this._fn = new Function(TSI_CTX, '_t', ...(params ?? []), this.scriptJs
                            + `\n//# sourceURL=tsi_js_${this.idUnic.uid}.js`);
    } catch (err) { throw new Error(TsiTokenizer.posError(tk.str, t0.pos, `script — ${err.message}`)); }
    if (!this._keepJs()) this.scriptJs = null;
  }
  //  ═══ LE TRANSCRIPTEUR (étapes 2-5) ═══════════════════════════════════════
  //  L'aiguillage des SIGNES tispi — variable, fonction, path-default — et la
  //  COPIE TEL QUEL des sections non-tispi : le texte entre deux signes part dans
  //  les tranches [pos, t.pos[. Les gardes sont GRATUITES : une chaîne est UN
  //  token (jamais type var), un commentaire n'émet AUCUN token — tous deux
  //  voyagent dans les tranches, intacts.
  transcrire(tk, debut, fin, posDeb) {                 // posDeb : le repère de tête du corps (2 ter)
    this._t = [];
    //  cles : 'v$nom'/'f$nom' → indice _t — dédoublonnage, la NATURE dans la clé
    //  ($total var ≠ $total( fonction). Partagée avec les plages RÉCURSIVES.
    return this._range(tk, debut, fin, new Map(), posDeb);
  }
  //  UNE PLAGE de tokens → son texte transcrit. Récursive : l'intérieur d'un [face]
  //  est une plage comme une autre — variables, fonctions, formules y tombent
  //  gratuitement, et la boucle-fille du chemin garde la main après le ']'.
  _range(tk, debut, fin, cles, posDeb) {
    const str  = tk.str;
    let out = '', pos = posDeb ?? tk.tokens[debut].pos;   // le corps part du repère ; une plage récursive, de son premier token
    for (let i = debut; i < fin; i++) {
      const t = tk.tokens[i];
      //  LA DÉCLARATION DE FONCTION — `function $nom(…) { … }`, toujours dans un
      //  corps. Le geste a lieu AU BUILD : TsiValFuncDeclar lit, compile et DÉPOSE
      //  sur la Pièce ; le texte est RETIRÉ du script produit — le laisser recréerait
      //  à chaque tir une fonction locale homonyme, qui masquerait celle du registre.
      //  `src` garde la source, donc l'export reste byte-exact.
      if (t.type === 'ident' && t.val === 'function' && tk.tokens[i + 1]?.type === 'var') {
        tk.current = i;
        TsiValFuncDeclar.build(tk, this.getPiece());        // lit, compile, DÉPOSE
        const last = tk.tokens[tk.current - 1];             // le '}' du corps, consommé
        out += str.slice(pos, t.pos);                       // le texte AVANT la déclaration
        pos = last.pos + String(last.val).length;            // …et on SAUTE la déclaration
        i = tk.current - 1;                                  // la boucle fera i++
        continue;
      }
      if (t.type === 'attr')
        TsiError.error(`${t.val} : attribut dans un corps — hors périmètre (les attributs restent hors TsiJs)`);
      if (t.type !== 'var') continue;                    // tout le reste est du TEXTE — copié tel quel
      //  APRÈS UN '.', TOUT EST JS (PD 26/08) — `config.$v` est un accès de propriété
      //  JavaScript légal : le sigil y est un caractère de nom, RIEN ne se convertit.
      if (i > debut && tk.tokens[i - 1].val === '.') continue;
      //  '->' HORS CHEMIN — la relation Tispi part d'une Pièce, jamais d'un objet JS.
      if (i > debut && tk.tokens[i - 1].val === '->')
        TsiError.error(`->${t.val} : la relation '->' part d'une Pièce (chemin) — ici l'objet est du JS`);
      //  LA TÊTE (6.1) + LES STEPS (6.2) — le chemin est consommé D'UN GESTE depuis
      //  sa tête ; pas de pile : la réentrance de la boucle-mère couvre les
      //  imbrications. Le path-default $this en est la tête dégénérée (zéro step).
      //  LA VARIABLE EN TÊTE DE CHEMIN (10/09) — `$scene->$play()`, `$monde->$gotoStop(1)` (notice §5, §8) : elle porte un
      //  nœud (`$scene = this;`) ; sa valeur est la Pièce de départ, VÉRIFIÉE AU TIR par TsiJs.tete (passe 7 : refusée à
      //  tort au build, « objet JS » — le réécriveur jugeait la forme, pas la valeur).
      const varTete = tk.tokens[i + 1]?.val === '->' && t.val !== '$this' && t.val !== '$parent' && t.val !== '$up';
      if (t.val === '$this' || t.val === '$parent'
          || (t.val === '$up' && tk.tokens[i + 1]?.val === '(') || varTete) {
        out += str.slice(pos, t.pos);
        if (t.val === '$up') {
          //  $up(critère) — comme TsiValOriginUp : le 1er ancêtre NOMMÉ
          //  (getNamedAncestor ; le prédicat-fn reste TODO, parité avec l'ancien).
          //  L'argument = une PLAGE transcrite ; le bareword seul se met en chaîne.
          const ouvr = tk.tokens[i + 1], iFerm = ouvr.posPair;
          if (iFerm == null)
            throw new Error(TsiTokenizer.posError(str, ouvr.pos, `$up : ')' manquant`));
          const seul = iFerm === i + 3 && tk.tokens[i + 2].type === 'ident';
          const arg  = seul ? `'${tk.tokens[i + 2].val}'`
                            : this._range(tk, i + 2, iFerm, cles);
          out += `${TSI_CTX}.piece.getNamedAncestor(${arg})`;
          pos = tk.tokens[iFerm].pos + 1;              //  après le ')'
          i = iFerm;                                   //  la boucle-fille enchaîne : $up(menu).fx…
        } else if (varTete) {
          let idx = cles.get('v' + t.val);
          if (idx === undefined) { idx = this._t.length; cles.set('v' + t.val, idx); this._t.push(TsiVar.noteRead(new TsiVar(t.val, this.getPiece(), this._ctx), t.pos)); }
          out += `TsiJs.tete(_t[${idx}].valueJs, '${t.val}')`;
          pos = t.pos + t.val.length;
        } else {
          out += t.val === '$this' ? `${TSI_CTX}.piece` : `${TSI_CTX}.piece.getPieceParent()`;
          pos = t.pos + t.val.length;
        }
        //  LES STEPS — LA RELATION TISPI EST '->' (PD 26/08) : le '.' était DÉTOURNÉ,
        //  il est rendu au JavaScript. Après '->' tout est Tispi (fille, $var, $fonc,
        //  [face]) ; après '.' tout est JS, sigil compris. `$this.div.id` est légal.
        const porteur = this.getPiece();
        while (tk.tokens[i + 1]?.val === '->') {
          const nom = tk.tokens[i + 2], apres = tk.tokens[i + 3];
          if (nom?.type === 'var') {                     //  .$fonc( / .$var — LA CIBLE (6.4)
            //  6.4-VARIABLE — .$etat : la variable DE LA CIBLE. La MÊME TsiVarJs
            //  qu'au contexte entre dans _t (construction au build, PD) ; `var()`
            //  la LIE au récepteur (TsiVarRef) et `.valueJs` porte l'opération —
            //  lecture ET écriture, JS tranche par la position.
            //      $this.$etat = dos   →   _ctx_.piece.var(_t[N]).valueJs = 'dos'…
            if (apres?.val !== '(') {
              let idx = cles.get('v' + nom.val);
              if (idx === undefined) {
                idx = this._t.length; cles.set('v' + nom.val, idx);
                this._t.push(new TsiVar(nom.val, porteur, this._ctx));
              }
              out += `.var(_t, ${idx}).valueJs`;
              pos = nom.pos + nom.val.length;
              i += 2;
              break;                                     //  le TERMINAL clôt le chemin — la suite est du JS
            }
            //  SYSTÈME puis APPLI (la cascade funcDeclar depuis le porteur) — les
            //  modules viendront avec leur chantier. L'ordre d'en-tête sert l'appli.
            const decl = o_.functions[nom.val] ?? TsiFuncsDeclar.fromPiece(nom.val, porteur);
            if (!decl)
              throw new Error(TsiTokenizer.posError(str, nom.pos, `fonction « ${nom.val} » inconnue (système, appli)`));
            let idx = cles.get('f' + nom.val);
            if (idx === undefined) { idx = this._t.length; cles.set('f' + nom.val, idx); this._t.push(decl); }
            const vide = tk.tokens[i + 4]?.val === ')';  //  '(' collé à ')' — aucun argument
            out += `.fcJs(${TSI_CTX}, _t[${idx}]._fn${vide ? '' : ', '}`;
            pos = apres.pos + 1;                         //  le '(' est consommé ; ')' suivra tel quel
            i += 3;                                      //  '.', '$fonc', '(' — l'appel REND LA MAIN au JS
            break;
          }
          if (nom?.type !== 'ident') break;
          if (apres?.val === '(')                        //  ->ident( : rien de Tispi n'a cette forme
            TsiError.error(`->${nom.val}( : une méthode s'appelle par '.' — '->' mène à une fille`);
          //  [face] (6.3) — la face qualifie CETTE descente : .fiche[…] → toPiece('fiche', …).
          //  L'intérieur est une PLAGE transcrite (récursion) : $i, formules, fcJs, gabarits
          //  JS — tout y tombe. Le SEUL cas décidé à part : le bareword nu ([dos]) se met
          //  en chaîne — un ident seul serait un identifiant JS inexistant au tir.
          if (apres?.val === '[') {
            const iFerm = apres.posPair;
            if (iFerm == null)
              throw new Error(TsiTokenizer.posError(str, apres.pos, `[face] : ']' manquant`));
            const seul = iFerm === i + 5 && tk.tokens[i + 4].type === 'ident';
            const face = seul ? `'${tk.tokens[i + 4].val}'`
                              : this._range(tk, i + 4, iFerm, cles);
            out += `.toPiece('${nom.val}', ${face})`;
            pos = tk.tokens[iFerm].pos + 1;              //  après le ']'
            i = iFerm;                                   //  la boucle-fille CONTINUE : .fiche[$i].sub reste un chemin
            continue;
          }
          out += `.toPiece('${nom.val}')`;               //  LA DESCENTE — le récepteur est la cible
          pos = nom.pos + nom.val.length;
          i += 2;
        }
        continue;
      }

      //  $thisCss (PD 07/09, étape 6) : le PROXY css de la Pièce courante — `$thisCss.rx = 180` écrit la variable
      //  `css $rx` SUR l'élément qui la déclare (remontée resolveVar) ; la suite (`.rx = …`) est du JS ordinaire.
      if (t.val === '$thisCss') {
        out += str.slice(pos, t.pos) + `TsiVarCss.proxyOf(${TSI_CTX}.piece)`;
        pos = t.pos + t.val.length;
        continue;
      }
      //  $up NU (sans parenthèse) : nom RÉSERVÉ — jamais une variable.
      if (t.val === '$up')
        throw new Error(TsiTokenizer.posError(str, t.pos, `$up : tête de path — l'argument s'écrit $up(critère)`));
      const suiv  = tk.tokens[i + 1];
      const appel2 = suiv?.type === 'block' && suiv.val === '(' && i + 1 < fin;
      //  LA FONCTION (étapes 3-4, PD 25/08) — le MODÈLE (TsiValFuncDeclar) entre
      //  dans _t AU BUILD ; l'appel est du JS direct : ni run, ni exe, ni objet neuf.
      //      $fonc(a, b)  →  _ctx_.piece.fcJs(_ctx_, _t[N]._fn, a, b)
      //  La recherche : table SYSTÈME pour l'instant (puis l'appli, puis les modules).
      if (appel2) {
        //  SYSTÈME puis APPLI (cascade funcDeclar depuis le porteur du bloc).
        const decl = o_.functions[t.val] ?? TsiFuncsDeclar.fromPiece(t.val, this.getPiece());
        if (!decl)
          throw new Error(TsiTokenizer.posError(str, t.pos, `fonction « ${t.val} » inconnue (système, appli)`));
        let idx = cles.get('f' + t.val);
        if (idx === undefined) { idx = this._t.length; cles.set('f' + t.val, idx); this._t.push(decl); }
        const vide = tk.tokens[i + 2]?.val === ')';
        out += str.slice(pos, t.pos) + `${TSI_CTX}.piece.fcJs(${TSI_CTX}, _t[${idx}]._fn${vide ? '' : ', '}`;
        pos = suiv.pos + 1; i++;                         // le '(' est consommé ; ')' suivra tel quel
        continue;
      }
      //  LA VARIABLE (étape 2) — $nom → _t[i].valueJs : RÉIFIÉE, un seul objet par
      //  nom (dédoublonnage) ; lecture ET écriture, JS tranche par la position.
      let idx = cles.get('v' + t.val);
      if (idx === undefined) {
        idx = this._t.length; cles.set('v' + t.val, idx);
        this._t.push(TsiVar.noteRead(new TsiVar(t.val, this.getPiece(), this._ctx), t.pos));   // vérifiée au start (D-2)
      }
      out += str.slice(pos, t.pos) + `_t[${idx}].valueJs`;
      pos = t.pos + t.val.length;
    }
    return out + str.slice(pos, tk.tokens[fin]?.pos ?? str.length);
  }
  //  La conservation de scriptJs — la Pièce PRIME sur le flag de page :
  //  $$keepJs > $$supprJs > o_.start(…, keepJs) > défaut : suppression.
  _keepJs() {
    const a = this.getPiece()?.attrs;
    if (a?.['$$keepJs'])  return true;
    if (a?.['$$supprJs']) return false;
    return !!o_.options.keepJs;
  }

  //  PESSIMISTE (PD 2026-08-23) : `src` est lue TELLE QUELLE — un « stop » en
  //  commentaire répond oui, et c'est le bon sens de l'erreur (un faux positif ne
  //  coûte que le canal : le timer au lieu du premier-fini, plus lent, jamais faux ;
  //  un faux négatif, lui, RATE un stop).
  contientStop() { return this.src?.includes('stop') ?? false; }
  debuild(ctx) { ctx.dt += this.src; }                       // la source copiée-collée — jamais réassemblé
}



// ═══════════════════════════════════════════════════════════════════════════
//  TsiValMacro — LA VARIABLE-MACRO : un morceau de script réutilisable
// ═══════════════════════════════════════════════════════════════════════════
//  Une macro n'est PAS un mécanisme d'exécution : c'est une INCRUSTATION
//  TEXTUELLE au parse. Le texte incrusté devient indiscernable de ce que
//  l'auteur aurait écrit à la main — d'où le nom : « la macro fond ».
//  Elle vit donc entièrement AU BUILD ; à l'exécution, elle n'existe plus.
//
//  ── 1. DÉCLARATION ────────────────────────────────────────────────────────
//  Dans la zone de tête d'une Pièce, comme toute variable, avec `:=` :
//
//      $macroPistes := `&pos 0:10,20; &opacity 0:1;`      ← corps de PISTES
//      $macroKeys   := `:0:10,20; 30:200,100;`            ← corps de KEYS
//
//  C'est le PREMIER CARACTÈRE du corps qui dit sa nature, et lui seul :
//      '&' → macro de PISTES (target 1) — le '&' fait partie du corps, il est GARDÉ
//      ':' → macro de KEYS   (target 0) — l'entête ':' est STRIPPÉE à l'incrustation
//      autre → ce n'est pas une macro de script : insertMacro rend false
//  La valeur ne porte que sa SOURCE (`this.src`, normalisée) : rien n'est
//  analysé à la déclaration. Le corps n'est tokenisé qu'à l'usage.
//
//  ── 2. INCRUSTATION ───────────────────────────────────────────────────────
//  À l'USAGE — le nom écrit seul, sans `:=` ni `=` —, TsiBuilder.insertMacro
//  remplace le token `$nom` par le corps, ENCADRÉ de deux balises :
//
//      src = nom + '< ' + target + ' ' + src + ' ; ' + nom + '> ' + target;
//      tk.splice(tk.current, 1, src);                    (tispiBuild.js)
//
//  `tk.splice` est COHÉRENT : il maintient ensemble les tokens, `this.str`, les
//  positions CARACTÈRE (`pos`) et les index de paires (`posPair`) — sans quoi
//  toute erreur ultérieure pointerait à côté, et les sauts d'appariement
//  seraient faux. Le corps est re-tokenisé par un tokenizer local, dont les
//  tokens sont rebasés à l'insertion.
//
//  Deux détails d'écriture, tous deux nécessaires (cf. tispiBuild.js) :
//    • l'ESPACE après target — sinon il colle au corps (`< 1200,500` → un
//      unique token `1200`) ;
//    • le ';' AVANT la balise fermante — il blinde la frontière : un corps sans
//      ';' final laisserait le fermant en position de VALEUR. Un ';' isolé est
//      toujours inoffensif (le walk l'ignore).
//
//  Les BALISES SONT TEMPORAIRES : elles ne servent qu'à déclencher une action
//  au passage du walk, et ne sont mémorisées nulle part. Rien ne les ré-émet.
//
//  GARDE DE CYCLE : si le nom est DÉJÀ ouvert dans `piece.macros`, l'incrustation
//  lève — `$a := \`… $a …\`` provoquerait un splice infini.
//
//  ── 3. MARQUAGE (la provenance) ───────────────────────────────────────────
//  Au walk, `$nom` suivi de `<` ou `>` n'est pas une variable mais une balise :
//  TsiBuilder.macroMark la lit et construit TsiMacroOpen | TsiMacroClose
//  (tispiParser.js).
//      OUVRANTE  → empile la paire [nom, target] dans `piece.macros`
//      FERMANTE  → dépile
//  La pile porte donc l'IMBRICATION : [0] = la macro la plus extérieure,
//  la dernière = la plus intérieure.
//
//  À CHAQUE CRÉATION d'une piste ou d'une key, l'état de la pile est COPIÉ sur
//  l'élément — `track.macros` / `key.macros` (tispiBuild.js) : c'est la
//  provenance, ce qui permettra de RECOLLER `$nom` à la restitution au lieu de
//  ré-émettre le corps développé.
//
//  Portées observées : une track-macro marque la piste ET ses keys ; une
//  key-macro ne marque que les keys — la piste hôte reste à l'auteur.
//
//  ── 4. LE RECOLLAGE (FAIT, 2026-08-14/15) ─────────────────────────────────
//  La restitution lit la pile DIRECTEMENT — `[0]`, la macro la plus extérieure —
//  et discrimine par le TARGET : le nom s'écrit UNE fois, puis la boucle CONSOMME
//  les éléments contigus de la même macro (contigus par construction, l'incrustation
//  étant textuelle en un seul point) :
//      target 1 (PISTES) → TsiPiece.debuildTracks   (tispiPiece.js)
//      target 0 (KEYS)   → TsiTrack.debuildKeys     (tispiTrack.js)
//  Éprouvé sur le splice RÉEL (déclaration + usage + relecture), banc_macro_get.
//    ⚠ Les lecteurs interrogeaient `_macro`, un champ qui n'a jamais existé dans
//      aucune classe — corrigé en `macros`. Et `varMacro` (le nom du 1er niveau,
//      qu'on croyait devoir DÉRIVER) a été RETIRÉ de TsiTrack et TsiKey : jamais
//      écrit, jamais lu — la pile porte déjà le nom, on le lit dedans.
//
//  ── PIÈGES MESURÉS ────────────────────────────────────────────────────────
//    • L'usage placé IMMÉDIATEMENT après la déclaration est mangé par la boucle
//      des variables de tête (`buildHead`), qui prend tout `$nom` pour une
//      variable : `$m := \`&pos …\`; $m` → « variable $m : fin de flux
//      inattendue ». L'usage doit venir en position de PISTE, donc après un `&`.
//    • Une macro INTROUVABLE ne lève pas : insertMacro supprime le token et rend
//      true (son propre TODO le signale). L'erreur est silencieuse.
//    • Ces erreurs de build sont DIFFÉRÉES au DOMContentLoaded par l'isolation
//      par élément : dans un banc, ou si le document est déjà chargé, elles
//      peuvent se perdre. Cf. « Isolation du build = cause masquée ».
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
//  TsiValUserJs — LA DÉPENDANCE JAVASCRIPT D'UNE BRANCHE
//
//      $$monJs = `<script type='text/javascript' src='wv_.js'></script>`;
//
//  Discriminé au CONTENU : un backtick qui ouvre sur `<script`. Le nom de
//  l'attribut est LIBRE ($$monJs, $$libAudio…) — plusieurs fichiers, chacun
//  nommé, et le dédoublonnage se fait sur le TEXTE.
//
//  ⚠ APOSTROPHES, PAS DE GUILLEMETS — la valeur est stockée TELLE QU'ÉCRITE :
//  aucune conversion (essayée puis retirée, PD 2026-08-17 : « trop compliqué si
//  délimiteur de texte imbriqués » — `src="a'b'c"` deviendrait illisible). Un `"`
//  tapé nu FERME le data-tsi au parse HTML, donc AVANT que le moteur voie quoi
//  que ce soit : rien ne peut le rattraper. L'autre écriture légale est `&quot;`,
//  que le navigateur décode avant la lecture.
//
//  POURQUOI DANS LE MODÈLE. Sans ça, rien ne relie une Pièce au fichier qui
//  déclare les fonctions qu'elle appelle : la branche copiée dans une autre page
//  casse en silence. Ici la dépendance VOYAGE AVEC LA BRANCHE.
//
//  DEUX PRODUITS AU DEBUILD, et c'est le point à ne pas rater :
//    1. la SOURCE dans ctx.dt — l'attribut est la VÉRITÉ ; ne pas l'émettre le
//       perdrait au round-trip, et la sauvegarde SUIVANTE viderait la zone ;
//    2. le DÉPÔT dans la table de la sauvegarde (Set, dédoublonnage) — la zone
//       <!--[tispi_js_user]--> du head en est le DÉRIVÉ, régénéré.
//  Hors sauvegarde (banc, export partiel), la table n'existe pas : le `?.` rend
//  le dépôt silencieux, l'émission reste correcte.
// ═══════════════════════════════════════════════════════════════════════════
class TsiValUserJs extends TsiVal {
  constructor(piece, ctx) { super(piece, ctx); }
  build(tk) { this.src = TsiVal._normText(tk.next().val); }
  get()     { return this.src; }                    // la balise <script…> telle quelle
  debuild(ctx) {
    ctx.dt += '`' + this.src + '`';                 // 1 — la SOURCE (round-trip)
    o_.projet?.userJs?.add(this.src);               // 2 — le DÉRIVÉ (zone du head)
  }
}

class TsiValMacro extends TsiVal {              // := `…`  — La macro fond ici
  constructor(piece, ctx) { super(piece, ctx); this._node = piece; }

  //  La valeur ne garde que sa SOURCE : l'incrustation la relira au splice.
  //  (_normText normalise les fins de ligne du corps backtick.)
  build(tk) { this.src = TsiVal._normText(tk.next().val); }
  debuild(ctx) { ctx.dt += '`' + this.src + '`'; }    // round-trip : la source, telle quelle

  //  (L'usage d'une macro — l'incrustation par splice — vit au SITE STATIQUE,
  //   TsiBuilder.insertMacro. Un déménagement polymorphe vers cette classe a été
  //   exploré puis ABANDONNÉ le 19/08 : la fille exécute à la DÉCLARATION, plus
  //   personne n'avait besoin de surcharger l'usage.)
}

// ── MACRO-ACTION : `{ script }` — SERVICE D'ACTIONS D'INITIALISATION AU BUILD ──
//  (PD 2026-08-20 : « pas une fonction — un service d'initialisation au build ».)
//  L'héritière de la famille — « la variante est déjà dans le nom » : macro-action.
//  Le FILTRE BACKTICK la fait naître quand le corps commence par '{' (buildValueSimple) ;
//  elle COMPOSE son TsiJs (héritage simple oblige) :
//    · le bloc s'EXÉCUTE À LA DÉCLARATION, au build — aucun usage requis : c'est
//      de l'INITIALISATION, pas un appelable ;
//    · la LECTURE (une key `&onClick 0:$fc02;`) exécute aussi ;
//    · l'export ré-émet la déclaration byte-exacte (debuild de la mère : `…`).
class TsiValMacroAction extends TsiValMacro {
  constructor(piece, ctx) {
    super(piece, ctx); this._ctx = ctx; this.action = null;
  }
  //  REVIENT SUR LE '{' : le corps backtick est UN token string du flux principal —
  //  son '{' n'y existe pas comme token. On prend donc la source telle quelle
  //  (sans _normText : le corps est du JS, un `\n` littéral doit y rester littéral),
  //  on la re-tokenise, et l'action se construit sur ce flux neuf.
  build(tk) {
    this.src = tk.next().val;                         // src = le corps, commence par '{'
    //  Re-tokenise puis passe par l'AIGUILLAGE (coupe 26/08) : le corps `{…}` prend
    //  la branche accolade du parseur texte — plus aucun client de l'ancien build.
    this.action = TsiVal.aiguillage(new TsiTokenizer(this.src), this._node, { ...this._ctx });
    this.action.get(this._node);                      // EXÉCUTION IMMÉDIATE — le porteur est `_ctx_`
  }
  get(ctx)     { return this.action.get(ctx); }       // la LECTURE exécute (une key qui lit la var)
  findVar(nom) { return this.action.findVar(nom); }
  //  MON PORTEUR : le bloc compilé. `src` garde le texte écrit (export byte-exact),
  //  `action` porte le vivant — et lui seul est un composant.
  messageComponents(onComp) {
    if (!this.action) return;
    const r = onComp(this.action, 'value'); if (r && r !== 'continue') return r;
    return this.action.messageComponents?.(onComp);
  }
}

//  (TsiValActionJS — SUPPRIMÉE le 2026-08-25 (PD : « c’est un TsiJs en fait ») ; aucune page ne l’écrivait en key ; mesuré avant coupe.)

//  (Le citoyen de VALEUR de l'ancienne forme `~function` a été SUPPRIMÉ le 2026-08-18
//   (ordre PD) : jamais construit, et sans site depuis que la déclaration s'écrit
//   `function $nom(…) { … }` DANS un bloc, toujours dans un bloc. Son nom,
//   TsiValFuncDeclar, a été REPRIS le même jour par la classe de déclaration de
//   tispiFuncs.js (ex-TsiFuncDeclarScript) — ce ne sont pas les mêmes objets.
//   Le chemin vivant : convertir (branche `function $nom`) → TsiValFuncDeclar.build,
//   qui lit, compile et dépose sur piece.funcDeclar ; le `src` du BLOC porte le texte
//   pour l'export.)

class TsiValPcOffset extends TsiVal {            // := 50%10  ([pc, off], pc/off nullables)
  constructor(piece, ctx) { super(piece, ctx); }
  build(tk)  { this.pc = tk.next().val; }            // token élémentaire [pc, off]
  get()        { return this.pc; }                     // [pc, off] — le consommateur (Pos…) fait le calc%
  setValue(v)  { this.pc = v; }
  debuild(ctx)  { const [pc, off] = this.pc; ctx.dt += `${pc == null ? '+' : pc}%${off == null ? '' : off}`; }
  //toCss()      { const [pc, off] = this.pc;            // composantes (comme Pos) : le calc revient au consommateur
  //               return { whole: this.debuild(), parts: [pc ?? '', off ?? ''] }; }
}

// ── ACCÉLÉRATION : le créneau `<durée: ACCÉLÉRATION effet délai:>` d'une transition ──────────
//  UNE CLASSE PAR VALEUR du vocabulaire, une OCCURRENCE FIXE par classe (singleton) : les
//  alias du script pointent la même instance, qui sait comment elle se ré-écrit. C'est ce qui
//  supprime la table inverse — l'ancien _EASE_INV se reposait sur « le dernier alias gagne »
//  pour retrouver la forme canonique ; ici chaque occurrence porte la sienne.
//  debuild() : la forme canonique ré-émise à l'export — les COURTES quand elles existent.
//  getCss() : la POSE dans une déclaration — easing d'un animate, chaîne `transition:`.
//  get(p)   : le CALCUL — la fraction p ∈ [0,1] ACCÉLÉRÉE par la courbe. C'est la classe
//             qui calcule, pas l'appelant : `TsiEase` (tispiTools.js) n'est que sa
//             bibliothèque de courbes, comme une piste s'appuie sur sa classe TsiCss*.
//  AUCUN ÉTAT : le parent ne DÉCLARE que le contrat, vide ; chaque occurrence l'implémente
//  et rend sa valeur en dur. Les méthodes vivent sur le prototype — rien n'est écrit à la
//  construction, rien n'est cherché à la lecture. La classe EST la valeur. (TsiValCubic est
//  la seule à porter un état : sa valeur dépend de ses points de contrôle.)
class TsiValEase_ {
  static isTsiValue = true;
  get(_p)   { }        // fraction accélérée      (surchargé)
  getCss()  { }        // forme CSS / WAAPI       (surchargé)
  debuild() { }        // forme canonique du script (surchargé)
}
class TsiValLinear         extends TsiValEase_ { get(p) { return p; }  getCss() { return 'linear'; }  debuild() { return '_l_'; } }
class TsiValEase           extends TsiValEase_ { get(p) { return TsiEase.ease(p, 'ease'); }  getCss() { return 'ease'; }  debuild() { return '_e_'; } }
class TsiValEaseIn         extends TsiValEase_ { get(p) { return TsiEase.ease(p, 'ease-in'); }  getCss() { return 'ease-in'; }  debuild() { return '_in_'; } }
class TsiValEaseOut        extends TsiValEase_ { get(p) { return TsiEase.ease(p, 'ease-out'); }  getCss() { return 'ease-out'; }  debuild() { return '_out_'; } }
class TsiValEaseInOut      extends TsiValEase_ { get(p) { return TsiEase.ease(p, 'ease-in-out'); }  getCss() { return 'ease-in-out'; }  debuild() { return '_io_'; } }
class TsiValStepStart      extends TsiValEase_ { get(p) { return TsiEase.ease(p, 'step-start'); }  getCss() { return 'step-start'; }  debuild() { return 'stepstart'; } }
//  `fixed` (PD 30/09) : la valeur TIENT jusqu'à la key suivante, puis saute — c'est `step-end`. Ex-TsiValStepEnd, sans usage ; ré-émise `_f_`.
class TsiValFixed          extends TsiValEase_ { get(p) { return TsiEase.ease(p, 'step-end'); }  getCss() { return 'step-end'; }  debuild() { return '_f_'; } }

// SINGLETONS — jamais de `new` chez les clients (comme TSI_TRUE / TSI_FALSE).
const TSI_LINEAR      = new TsiValLinear();
const TSI_EASE        = new TsiValEase();
const TSI_EASE_IN     = new TsiValEaseIn();
const TSI_EASE_OUT    = new TsiValEaseOut();
const TSI_EASE_IO     = new TsiValEaseInOut();
const TSI_STEP_START  = new TsiValStepStart();
const TSI_FIXED       = new TsiValFixed();

// La SEULE forme paramétrée : une instance par jeu de points de contrôle, donc pas de singleton.
// `TsiEase.cubicBezier` (tispiTools.js) fait le calcul de courbe ; ici on ne porte que la valeur.
class TsiValCubic extends TsiValEase_ {
  constructor(cp) {                                     // cp = [x1, y1, x2, y2]
    super();
    this.cp   = cp;                                     // SON état : les points de contrôle
    this._css = `cubic-bezier(${cp.join(',')})`;        // mémos : composés UNE FOIS, pas à chaque lecture
    this._src = `_c_(${cp.join(',')})`;
    this._fn  = null;                                   // la courbe, construite au 1er calcul
  }
  getCss()  { return this._css; }
  debuild() { return this._src; }
  // Elle PORTE ses points de contrôle : la courbe se construit une fois, depuis eux —
  // pas de ré-extraction par expression régulière depuis la chaîne CSS.
  get(p) { return (this._fn ??= TsiEase.cubicBezier(...this.cp))(p); }
}

// ANNUAIRE du vocabulaire : plusieurs mots du script → la MÊME occurrence.
// Il vit ICI, avec les classes : tispiParser.js est chargé AVANT tispiVar.js, un littéral
// `{ linear: new TsiValLinear() }` y lèverait un ReferenceError (évaluation à la définition).
TsiValEase_.MOTS = {
  linear: TSI_LINEAR,  _l_:   TSI_LINEAR,
  ease:   TSI_EASE,    _e_:   TSI_EASE,
  easein: TSI_EASE_IN, _in_:  TSI_EASE_IN,
  easeout: TSI_EASE_OUT, _out_: TSI_EASE_OUT,
  easeinout: TSI_EASE_IO, _io_: TSI_EASE_IO, _eo_: TSI_EASE_IO,   // _io_ canonique, _eo_ alias historique
  stepstart: TSI_STEP_START,
  fixed: TSI_FIXED, _f_: TSI_FIXED,                                  // la valeur TIENT jusqu'à la key suivante (PD 30/09)
  //  camelCase = l'écriture de la couche IA (25d, PD 07/09) — mêmes occurrences
  easeIn: TSI_EASE_IN, easeOut: TSI_EASE_OUT, easeInOut: TSI_EASE_IO, stepStart: TSI_STEP_START,
};
/** Mot du script (ou forme WAAPI déjà résolue, ou `_c_(…)`) → l'occurrence. */
TsiValEase_.build = function (mot) {
  if (mot instanceof TsiValEase_) return mot;                     // déjà réifiée
  const m = /^_c_\(([^)]+)\)$/.exec(mot);
  if (m) return new TsiValCubic(m[1].split(',').map(Number));
  return TsiValEase_.MOTS[mot] ?? TsiValEase_.PAR_WAAPI[mot] ?? TSI_LINEAR;
};
/** Chemin PROGRAMMATIQUE : un tableau JS peut porter la forme longue ('ease-in').
 *  L'index se construit par getCss() — l'occurrence dit sa forme, on ne la lui prend pas. */
TsiValEase_.PAR_WAAPI = Object.fromEntries(
  [TSI_LINEAR, TSI_EASE, TSI_EASE_IN, TSI_EASE_OUT, TSI_EASE_IO, TSI_STEP_START, TSI_FIXED]
    .map(e => [e.getCss(), e]));

//      ##########        #####       ###########    ####    #### 
//      ####    ####     ########        ####        ####    ####
//      ####    ####    ####  ####       ####        ####    ####
//      ##########      ####  ####       ####        ############
//      ####           ############      ####        ####    ####
//      ####           ####    ####      ####        ####    ####
//      ####           ####    ####      ####        ####    ####
// 

// ── Le signe `$var$` — l'occurrence interpolée DANS UN NOM. Un Get dont la forme
//    écrite porte le '$' FERMANT : l'ÉCHAPPEMENT de retour au littéral, consommé
//    au build (l. « '$' fermant ») et qui n'appartient pas au nom — le préfixe,
//    lui, appartient au nom (sigil gardé). Citoyen de la grammaire du motif :
//    le contenant redevient AVEUGLE, plus d'instanceof à l'émission.
class TsiVarGetInterpol extends TsiVarGet {
  debuild(ctx) { super.debuild(ctx); ctx.dt += '$'; }
}
//  (TsiValPath — SUPPRIMÉE à la coupe du 2026-08-26 : le parseur texte la remplace.)


// ═════════════════════════════════════════════════════════════════════════════
//  INSTRUCTIONS D'ÉDITION — le bloc `~<…>` : le CONTRAT d'un porteur (type,
//  doc…), lu au PARSE (check), ré-émis à l'EXPORT (debuild), consommé par
//  l'ÉDITEUR (saisies) et par l'IA. JAMAIS au runtime : le bloc est INERTE pour
//  l'œuvre — une branche sans bloc s'exécute à l'identique.
//    $prix ~<Number, `prix affiché`>:= 40,30;
//  Le bloc se lit APRÈS LE NOM, avant le discriminant (`:=` / `=` / rien) : il
//  qualifie la VARIABLE, pas la valeur — donc `:= _import` / `:= _null` peuvent
//  en porter sans règle spéciale. `<…>`/`!<…>` disent les caractéristiques du
//  TEMPS ; `~<…>` celles de l'ÉDITION (token dédié, cf. StiTokenizer).
// ═════════════════════════════════════════════════════════════════════════════

// ── UNE instruction (parent) — état + deux messages, aucun parsing imposé :
//    c'est le SITE qui lit (cf. TsiEditorInstrs.build). ──
class TsiEditorInstr {
  check(_tsiValue) {}                                  // validation ; no-op par défaut (la doc ne valide rien)
  debuild()        { return ''; }                      // ré-émission source
}

// ── TYPE : ident CamelCase (`Number`) → une classe de la famille TsiType* ──
class TsiEditorType extends TsiEditorInstr {
  static match(t) { return t.type === 'ident' && /^[A-Z]/.test(t.val); }
  build(tk) {
    const t = tk.next();
    this.type = o_.tsiTypes?.[t.val];                  // REGISTRE (comme o_.attrBehavior / o_.css)
    if (!this.type)
      throw new Error(TsiTokenizer.posError(tk.str, t.pos,
        `type '${t.val}' inconnu (connus : ${Object.keys(o_.tsiTypes ?? {}).join(', ')})`));
    this.nom = t.val;
  }
  check(tsiValue) { this.type.check(tsiValue); }
  debuild()       { return this.nom; }
}

// ── PARAMÈTRE : le signe `@` — cette variable est LISTÉE dans le nœud compressé.
//    Marque nue, sans argument : sa présence est toute l'information. Placée en
//    tête du groupe (l'ordre des créneaux est fixe). ──
class TsiEditorParam extends TsiEditorInstr {
  static match(t) { return t.val === '@'; }
  build(tk)  { tk.next(); }
  debuild()  { return '@'; }
}

// ── DOC : chaîne BACKTICKÉE nue — le backtick EST le marqueur (pas de mot-clé).
//    Dans le bloc c'est le parser du SITE qui lit : un backtick ouvrant par
//    `&`/`:` n'y est donc PAS une macro (règle de la fabrique de valeurs). ──
class TsiEditorDoc extends TsiEditorInstr {
  static match(t) { return t.type === 'string' && t.quote === '`'; }
  build(tk)  { this.texte = tk.next().val; }
  debuild()  { return '`' + this.texte + '`'; }
}

// ── LE BLOC (générique) : GROUPES séparés par ';', items par ','.
//    Lecture POSITIONNELLE ET TYPÉE — l'héritier déclare GROUPES = [[créneaux du
//    groupe 1], [groupe 2], …] ; un créneau est PRÉSENT si le token courant a sa
//    forme (`static match`), ABSENT sinon → on essaie le suivant SANS consommer.
//    Un créneau servi est consommé : un doublon tombe donc en « inattendue »
//    par construction. Les GROUPES existent pour l'ÉVOLUTION : on allonge le
//    groupe 1 (élémentaires) sans déplacer ce que le groupe 2 a figé. ──
class TsiEditorInstrs {
  build(tk) {
    tk.next();                                         // '~<'
    const GROUPES = this.constructor.GROUPES;
    this.groupes = [];                                 // items rangés PAR groupe (debuild fidèle)
    let g = 0, c = 0;                                  // groupe courant, créneau courant
    while (true) {
      const t = tk.peek(true);
      if (t === TsiTokenizer.END)
        throw new Error(TsiTokenizer.posError(tk.str, tk.str.length, `~< : '>' attendu`));
      if (t.val === '>') { tk.next(); break; }
      if (t.val === ';') { tk.next(); g++; c = 0; continue; }   // groupe suivant
      if (t.val === ',') { tk.next(); continue; }               // créneau suivant
      if (t.val === ':=' || t.val === '=')                      // l'opérateur de la variable : le '>' manque
        throw new Error(TsiTokenizer.posError(tk.str, t.pos, `~< : '>' attendu (bloc non fermé)`));
      const creneaux = GROUPES[g] ?? [];
      while (c < creneaux.length && !creneaux[c].match(t)) c++; // créneaux ABSENTS : sautés
      if (c >= creneaux.length)
        throw new Error(TsiTokenizer.posError(tk.str, t.pos,
          `~< : caractéristique inattendue '${t.val}' (groupe ${g + 1})`));
      const inst = new creneaux[c](); c++;             // le créneau est SERVI
      inst.build(tk);
      (this.groupes[g] ??= []).push(inst);
    }
    if (!this.groupes.length)
      throw new Error(TsiTokenizer.posError(tk.str, tk.peek(true)?.pos ?? tk.str.length, `~< : bloc vide`));
  }
  check(tsiValue) { for (const grp of this.groupes) for (const i of grp) i.check(tsiValue); }
  /** LECTURE du contrat — le chemin unique pour l'éditeur, l'IA et la compression :
   *  `rules.get(TsiEditorType)?.nom`, `rules.has(TsiEditorParam)`. Personne ne
   *  refouille les groupes à la main (l'ordre interne ne regarde que le parse). */
  get(Cls)  { for (const grp of this.groupes) for (const i of grp) if (i instanceof Cls) return i; return null; }
  has(Cls)  { return this.get(Cls) !== null; }
  debuild() {
    return '~<' + this.groupes.map(grp => grp.map(i => i.debuild()).join(', ')).join('; ') + '>';
  }
}

// ── LES SITES : chacun déclare LA SUITE de ses règles, groupe par groupe. Les
//    items, eux, sont NEUTRES (un type et une doc valent la même chose partout) :
//    c'est le site qui choisit son vocabulaire, pas qui redéfinit les mots. ──
class TsiEditorVarRules extends TsiEditorInstrs {
  static GROUPES = [[TsiEditorParam, TsiEditorType, TsiEditorDoc]];   // groupe 1 : élémentaires
}
class TsiEditorAttrRules extends TsiEditorInstrs {
  static GROUPES = [[TsiEditorType, TsiEditorDoc]];   // défaut d'un attribut : informatif (le contrat vit chez le producteur)
}

// ── MOMENT de duplication — deux CONSTANTES, sans mot-clé porteur : `duplic=` ne
//    dirait rien de plus que la constante elle-même. Forme : ident capitalisé —
//    d'où la nécessité d'un vocabulaire PROPRE (dans un bloc de variable, un
//    ident capitalisé est un TYPE : `~<RUN_TIME>` y serait un type inconnu). ──
class TsiEditorMoment extends TsiEditorInstr {
  static CONSTANTES = ['RUN_TIME', 'EDIT'];
  static match(t) { return t.type === 'ident' && TsiEditorMoment.CONSTANTES.includes(t.val); }
  build(tk)  { this.moment = tk.next().val; }          // RUN_TIME : clones nés au démarrage · EDIT : écrits à l'expansion
  debuild()  { return this.moment; }
}

// ── LE SITE `$$compressed` : son vocabulaire n'a PAS de créneau type — la
//    constante de moment y est donc lue sans ambiguïté. Les règles de duplication
//    (nommage, placement, limites, taille visible…) viendront s'ajouter ici, en
//    allongeant le groupe 1 ou en ouvrant un groupe 2. ──
class TsiEditorCompressedRules extends TsiEditorInstrs {
  static GROUPES = [[TsiEditorMoment, TsiEditorDoc]];
}

// ── LE SITE `$$copyNode` : coquille. Le nombre et l'arrangement sont dans la
//    VALEUR (`= 3, grille`) ; le bloc accueillera les paramètres de copie à
//    venir (limites, taille visible…) — encapsulé ici, il évolue sans toucher
//    aux autres attributs. ──
class TsiEditorCopyNodeRules extends TsiEditorInstrs {
  static GROUPES = [[TsiEditorDoc]];
}

// ═════════════════════════════════════════════════════════════════════════════
//  TYPES — famille À PART : un type est une notion de VALEUR, pas d'édition (il
//  servira aussi à valider une affectation au runtime). Le bloc ne demande à ses
//  items que `check(tsiValue)` + `debuild()` et se moque de leur lignée.
//  Registre `o_.tsiTypes` : un module peut ajouter son type sans toucher au moteur.
// ═════════════════════════════════════════════════════════════════════════════
class TsiType {
  /** LE point d'entrée de la vérification — les types n'implémentent que `_check`.
   *  Une valeur INDIRECTE (référence `$y`, appel `fn(1)`, path) ne se juge pas au
   *  parse : sa classe ne dit rien de ce qu'elle PRODUIRA. Règle : ne pas
   *  vérifier plutôt que vérifier faux — un type est informatif, un refus abusif
   *  ferait mentir la source. Absente (`:= _null`) : rien à juger non plus. */
  check(v) {
    if (v == null) return;
    if (!(v instanceof TsiVal) || v instanceof TsiVar) return;   // indirecte (TsiVar : Get/Set/Pipe) → non jugeable
    if (v instanceof TsiJs) return;                                  // produite au tir (script) → idem
    // (Le macro-script, lui, N'est PAS exclu : sa nature est connue au parse —
    //  c'est un corps de script — donc c'est au TYPE de l'accepter ou non.)
    this._check(v);
  }
  _check(_tsiValue) {}                                 // le jugement PROPRE au type (littéral direct seulement)
}
class TsiTypeNumber extends TsiType {
  // Nombre, ou tuple de nombres (`40,30`).
  _check(v) {
    const ok = v instanceof TsiValNumber
            || (v instanceof TsiValArray && v.array.every(c => c instanceof TsiValNumber));
    if (!ok) { const c = { dt: '' }; v.debuild(c);     // message d'erreur : la source de la valeur, via un ctx local
               TsiError.error(`type Number : valeur '${c.dt}' refusée`); }
  }
}
o_.tsiTypes = { Number: new TsiTypeNumber() };         // singletons : un type n'a pas d'état d'occurrence


//         #####      ###########   ###########   ############
//        ########       ####          ####       ####     ####
//       ####  ####      ####          ####       ####     ####
//       ####  ####      ####          ####       ############
//      ############     ####          ####       ####   ####
//      ####     ###     ####          ####       ####    ####
//      ####     ###     ####          ####       ####     ####
//


class TsiAttr{
  /** Le PARSE crée l'OCCURRENCE — aucun effet ici : les comportements
   *  s'installent en PHASE A (initAll). `contexte` = l'ENVIRONNEMENT de l'espace
   *  de traitement ({contenant, convertCodeName, editeur}), construit une fois
   *  par espace : le dépôt ne décide plus rien — la table contenante
   *  (piece.attrs | piece.editor.attrs) EST la famille. */
  static set(nom, tsiValue, contexte, rules = null) {
    const a = contexte.contenant[nom] = new TsiAttr(tsiValue, nom, o_.attrBehavior[nom]);
    if (rules) {
      a.rules = rules;                                 // contrat d'édition PORTÉ PAR L'OCCURRENCE (choix PD)
      // Un DRAPEAU nu n'a pas de valeur à typer : le type dit ce que serait la
      // valeur, pas ce qu'est la présence. On ne valide donc que le paramétré.
      if (tsiValue !== TSI_TRUE) rules.check(tsiValue);
    }
    return a;
  }
  /** PHASE A (preparePiece / prepareFace) : l'arbre est complet, l'horloge
   *  posée — chaque producteur installe son comportement. `startCtx` = le
   *  contexte du START ({clockCurr, stack}) — PAS le contexte de compilation :
   *  deux objets différents, ne pas confondre. RUNTIME seul : les attributs
   *  d'éditeur n'ont pas de comportement au start. */
  static initAll(piece, startCtx) {
    for (const nom in piece.attrs) {
      const a = piece.attrs[nom];
      a.producer?.init?.(a.tsiValue, piece, startCtx);
    }
  }
  constructor(tsiValue, nom, producer) {
    this.tsiValue = tsiValue; this.name = nom; this.producer = producer;
    this.rules = null;                                 // contrat d'édition `~<…>` (TsiEditorAttrRules), s'il est écrit
  }
  /** Rend la tsiValue, PAS sa résolution : `attr.get() === TSI_TRUE` teste le
   *  drapeau par identité (singleton). Valeur texte : `attr.get().get()`. */
  get() { return this.tsiValue; }

  //  MES PORTEURS : ma valeur (et ce qu'elle contient), et mon PRODUCTEUR — l'objet
  //  de service d'un attribut comportemental (`$$drag` → TsiAttrDrag),
  //  qui est lui-même un attribut. Cf. le contrat, TsiVal.
  messageComponents(onComp) {
    if (this.producer) {
      const p = onComp(this.producer, 'attr'); if (p && p !== 'continue') return p;
      const w = this.producer.messageComponents?.(onComp); if (w) return w;
    }
    const v = this.tsiValue;
    if (!v) return;
    const r = onComp(v, 'value'); if (r && r !== 'continue') return r;
    return v.messageComponents?.(onComp);
  }

  /** LA FORME DÉVELOPPÉE — `$$nom [~<…>] [= valeur]` : l'attribut s'écrit LUI-MÊME
   *  au fil du debuild (PD 2026-08-20). C'est l'inverse exact de buildEntree, et le
   *  véhicule des blocs d'en-tête de piste/key (`!<$$xl>` / `<$$xl>`) — la zone de
   *  NŒUD, elle, garde son transport CODÉ (debuildAttrsEnv, binaire + table). */
  debuild(ctx) {
    ctx.dt += this.name;
    if (this.rules) ctx.dt += ' ' + this.rules.debuild();
    const v = this.get();
    if (v === TSI_TRUE) return;                                       // drapeau : le nom suffit
    ctx.dt += ' = ';
    if (v instanceof TsiValArray) { ctx.dt += '['; v.debuild(ctx); ctx.dt += ']'; }   // crochets OBLIGATOIRES (grammaire du site)
    else v.debuild(ctx);
  }
}


// ═══════════════════════════════════════════════════════════════════════════
//  ATTRIBUTS — LA ZONE CODÉE (grammaire PD 2026-08-12)
//
//      zone    ::= série+
//      série   ::= entier ( ',' entrée )* ';'
//      entier  ::= ≥ 0 → RUNTIME, code = n   |   < 0 → ÉDITEUR, code = -n - 1
//      entrée  ::= ( pos | $$nom ) [ '~<' … '>' ] [ '=' valeur ]
//      valeur  ::= tsi-valeur | '[' tsi-valeur ( ',' tsi-valeur )* ']'   ← crochets
//                                              OBLIGATOIRES pour un tableau
//
//  L'appariement série ↔ table est ORDINAL, par environnement : la Nᵉ série
//  positive lit la table runtime N, la Nᵉ négative la table éditeur N — d'où les
//  bouche-trous « 0; » / « -1; » émis pour les tables non touchées.
//
//  LES TABLES SONT UN VÉHICULE, pas un registre : celles du chargement viennent
//  du fichier de transport `X_svg.js` de la page et meurent après le build ;
//  celles de la sauvegarde NAISSENT de la passe de debuild (chaque nom rencontré
//  prend la première place libre) et partent avec la page. Aucune stabilité
//  d'index d'une sauvegarde à l'autre — la table voyage avec la page qui l'utilise.
//
//  La forme développée `$$nom` est une ÉCRITURE MANUELLE : une entrée, jamais une
//  sortie. On écrit à la main, la machine compresse.
// ═══════════════════════════════════════════════════════════════════════════

//  L'ENVIRONNEMENT DES ATTRIBUTS — la mémoire GLOBALE d'une sauvegarde : par
//  environnement (RUNTIME / EDITOR), la table ILLIMITÉE des noms déjà utilisés,
//  keyée par NOM — chaque item DIT SA PLACE : [num, pos] (numéro d'entier-code-
//  binaire, position de la puissance de 2). Une seule structure : la recherche
//  EST le rôle de names (PD). Construite par la RACINE d'une sauvegarde
//  (exportBranch_) ; les places n'ont AUCUNE stabilité d'une sauvegarde à l'autre.
//
//  DEUX CONSTRUCTIONS (PD 2026-08-14) :
//   1. en fin de debuild du TsiNode — debuildAttrsLink : les codes/series LOCAUX
//      du nœud s'assemblent en séries dans SON data-tsi, puis meurent ;
//   2. en fin de debuild de la branche COMPLÈTE, à la création de la page HTML —
//      toTables() : la liste se découpe en tableaux de 31, le format du compagnon.
//
//  Un attribut TSI_TRUE (identité singleton) est TOUJOURS un drapeau — `= true`
//  est INTERDIT, on écrit `= \`true\`` — placé sous l'entête `true__` : deux
//  attributs de même nom mais de kinds différents (drapeau / valeur) ne se
//  détruisent pas dans la mémoire commune. Ses règles éventuelles partent en
//  entrée NUE `pos ~<…>` (le lecteur sans `=` repose déjà TRUE + règles).
//  Dernière pose prioritaire : pas de garde de double pose (PD).
class TsiAttrsOutService {
  static RUNTIME = 0;                               // signe du code : ≥ 0
  static EDITOR  = 1;                               //                 < 0  (code = -n - 1)
  static SIZE    = 31;                              // capacité d'un entier-code-binaire

  //  DÉBUT D'UNE SAUVEGARDE : la mémoire des noms repart à NEUF. C'est ICI que
  //  la classe se construit — l'appelant ne connaît pas son logement (o_.projet).
  //  UN FICHIER = UNE table : les entrées-fichier l'appellent en TÊTE, une fois,
  //  AVANT toute boucle de branches (la récursive, elle, n'y touche jamais). Les
  //  places n'ont aucune stabilité d'une sauvegarde à l'autre — les tables sont
  //  un TRANSPORT, pas un registre.
  static reset() {
    o_.projet ??= {};
    return o_.projet.attrs = new TsiAttrsOutService();
  }

  constructor() {
    //this.namesOut = [{}, {}];                          // par environnement : nom → [num, pos] — l'ITEM DIT SA PLACE
    //this.nextOut  = [{  }, { num: 0, pos: 0 }];   // la prochaine place libre, par environnement
    this.outs = [[{}, {num: 0, pos: 0}], [{}, {num: 0, pos: 0}]];                          // par environnement : num → entier-code-binaire (|=) — la SÉRIE
  }

  //  Un nom déjà posé garde SA place pour toute la sauvegarde ; un neuf prend la
  //  suivante — entier plein → le suivant s'ouvre.
  getAttrOut(nom, outEnv) {                                         // outEnv = TsiAttrsOutService.RUNTIME | EDITOR
    const itemsOut = this.outs[outEnv][0];
    let itemOut = itemsOut[nom];
    if (itemOut) return itemOut;
    const nextOut = this.outs[outEnv][1];
    itemOut = itemsOut[nom] = [nextOut.num, nextOut.pos];
    if (++nextOut.pos >= TsiAttrsOutService.SIZE) { nextOut.pos = 0; nextOut.num++; }
    return itemOut;
  }

  //  ── LE DEBUILD de la zone d'attributs d'UN nœud ──────────────────────────
  debuildAttrs(ctx, node) {
    const attrsEnv = [node.attrs ?? {}, node.editor?.attrs ?? {}];
    let isPresent = false;
    for (let env = 0; env < 2; env++) {
      const codesBin = [], vars = [];                // par RANG d'entier-code : drapeaux · ctx local des entrées
      this.debuildAttrsEnv(attrsEnv[env], env, codesBin, vars);
      isPresent = this.debuildAttrsLink(ctx, env, codesBin, vars, isPresent);
    }
    if (isPresent) ctx.dt += '\n';                       // nœud nu → aucune zone
  }

  /** PASSE 1 — LA boucle unique : la LECTURE des attributs du nœud, regroupée
   *  par entier-code-binaire. Les valeurs écrivent AVEUGLÉMENT dans le ctx
   *  LOCAL de leur série (même contrat {dt}), versé au rang voulu par le link.
   *
   *  @param {Object<string, TsiAttr>} attrsEnv    les attributs du NŒUD pour cet
   *                environnement — la table contenante (node.attrs |
   *                node.editor.attrs) : nom → TsiAttr
   *  @param {number} env    l'environnement traité : TsiAttrsOutService.RUNTIME (0) |
   *                EDITOR (1) — choisit la table de noms (this.names[env]) et,
   *                au link, le signe du code
   *  @param {number[]} codesBin    RÉCEPTACLE, par rang d'entier-code-binaire
   *                (CREUX) : les drapeaux nus accumulés (|=) — codes[num] =
   *                l'entier de la série num
   *  @param {{dt: string}[]} series    RÉCEPTACLE, par rang (CREUX) : le ctx
   *                LOCAL des entrées de la série — `, pos ~<règles>? = valeur`
   *                au fil de la lecture
   *
   *  Les deux réceptacles naissent VIDES chez l'appelant (debuildAttrs), vivent
   *  le temps du nœud, et sont versés dans ctx.dt par debuildAttrsLink. */
  debuildAttrsEnv(attrsEnv, envOut, codesBin, vars) {
    for (const nom in attrsEnv) {
      const attr = attrsEnv[nom], value = attr.get();
      if (value === TSI_FALSE) continue;                             // false = absent : non mémorisé
      const isTrue = (value === TSI_TRUE);                             // TOUJOURS un drapeau (`= true` interdit)
      const [num, pos] = this.getAttrOut(isTrue ? TsiAttrsBuilder.TRUE_HEADER + nom : nom, envOut);
      if (isTrue && !attr.rules) { codesBin[num] = (codesBin[num] ?? 0) | 2 ** pos; continue; }
      const s = vars[num] ??= { dt: '' };
      s.dt += ', ' + pos;
      if (attr.rules) s.dt += ' ' + attr.rules.debuild();
      if (isTrue) continue;                                        // drapeau À RÈGLES : entrée NUE, ni '=' ni valeur
      s.dt += ' = ';
      if (value instanceof TsiValArray) { s.dt += '['; value.debuild(s); s.dt += ']'; }   // grammaire du SITE : crochets OBLIGATOIRES
      else value.debuild(s);
    }
  }

  /** PASSE 2 — LINK, en fin de debuild du TsiNode : l'assemblage ORDINAL
   *  `code, entrées ;` — bouche-trous compris (un rang CREUX sort en `0;` /
   *  `-1;`, il tient le rang) ; éditeur : code décalé de 1 en négatif (jamais
   *  de -0).
   *
   *  @param {{out: string, dt: string}} ctx    LE contexte de la passe — l'assemblage
   *                s'écrit dans ctx.dt, à la suite de ce que le nœud y a déjà mis
   *  @param {number} env    l'environnement traité : TsiAttrsOutService.RUNTIME (0) |
   *                EDITOR (1) — donne le SIGNE du code émis
   *  @param {number[]} codesBin    les drapeaux par rang (CREUX), remplis par
   *                debuildAttrsEnv — consommés ici, meurent avec le nœud
   *  @param {{dt: string}[]} vars    les entrées par rang (CREUX), remplies par
   *                debuildAttrsEnv — versées ici au rang voulu
   *  @param {boolean} isPresent    y a-t-il DÉJÀ une série écrite ? (l'espace
   *                séparateur ne précède que la 2e et suivantes — jamais de
   *                relecture du buffer)
   *  @returns {boolean} `some` mis à jour — rendu à l'appelant pour l'environnement
   *                suivant et pour le '\n' final */
  debuildAttrsLink(ctx, env, codesBin, vars, isPresent) {
    for (let t = 0, n = Math.max(codesBin.length, vars.length); t < n; t++) {
      if (isPresent) ctx.dt += ' ';  isPresent = true;
      const code = codesBin[t] ?? 0;
      ctx.dt += (env === TsiAttrsOutService.EDITOR ? -(code + 1) : code);
      if (vars[t]) ctx.dt += vars[t].dt;
      ctx.dt += ';';
    }
    return isPresent;
  }

  //  CONSTRUCTION FINALE — fin de debuild de la branche complète, à la création
  //  de la page HTML : la découpe en tableaux de 31 cases, le format
  //  publié/chargé du fichier compagnon (attrsCode).
  //  « découpé tel que DÉCRIT DANS LES ITEMS » (PD) : chaque nom se range à la
  //  place que son item déclare.
  toTables() {
    return this.outs.map(([itemsOut]) => {            // outs[env] = [items, next] — la découpe ne lit que les items
      const tabs = [];
      for (const nom in itemsOut) { const [num, pos] = itemsOut[nom]; (tabs[num] ??= [])[pos] = nom; }
      return tabs;
    });
  }
}

//  (TsiAttrNameTab / TsiAttrNames / TsiAttrSlot / TsiAttrVal / TsiAttrsCode /
//   TsiAttrsCodes SUPPRIMÉES le 2026-08-14 — les tables n'existent plus pendant
//   la sauvegarde (liste plate de noms, place dérivée de l'index) et le graphe
//   jetable d'impression est remplacé par les codes/series LOCAUX du nœud.
//   Tout vit désormais dans TsiAttrsOutService, ci-dessus.)

//  LE BUILD — le miroir : trois fonctions, la zone, la série, l'entrée.
class TsiAttrsBuilder {

  //  [ tables-runtime, tables-éditeur ] — le VÉHICULE chargé par `X_svg.js`.
  //  Une page écrite à la main n'en a pas : ses entrées sont nommées ($$nom).
  static tables() { return o_.projet?.attrsCode ?? [[], []]; }

  //  L'ENTÊTE de transport d'un DRAPEAU : `true__$$nom` dans les tables publiées.
  //  INTACTE pendant toute la sauvegarde (PD) — retirée AU BUILD, ici, aux deux
  //  sites qui posent un nom lu des tables.
  static TRUE_HEADER = 'true__';
  static strip(nom) { return nom.startsWith(TsiAttrsBuilder.TRUE_HEADER)
                           ? nom.slice(TsiAttrsBuilder.TRUE_HEADER.length) : nom; }

  /** LA ZONE : présente si le data-tsi ouvre sur un ENTIER — positif ou négatif. */
  static buildAttrs(tk, piece) {
    const t = tk.peek(true);
    if (t === TsiTokenizer.END || t.type !== 'number') return;   // aucune zone
    piece.attrs  ??= {};
    piece.editor ??= { attrs: {} };
    const numTabs = [0, 0];                       // rang de la PROCHAINE série, par environnement
    while (tk.current < tk.length && tk.peek(true).type === 'number')
      TsiAttrsBuilder.buildSerie(tk, piece, numTabs);
  }

  /** UNE série : l'entier signé, ses drapeaux, ses entrées, son ';'. */
  static buildSerie(tk, piece, numTabs) {
    const t      = tk.next();                                    // l'entier codé
    const n      = Number(t.val);
    const numEnv = n < 0 ? TsiAttrsOutService.EDITOR : TsiAttrsOutService.RUNTIME;
    const code   = n < 0 ? -n - 1 : n;                           // décalage de 1 : jamais de -0
    const numTab = numTabs[numEnv]++;                            // appariement ORDINAL
    const noms   = TsiAttrsBuilder.tables()[numEnv][numTab];
    if (code && !noms)
      throw new Error(TsiTokenizer.posError(tk.str, t.pos,
        `attributs : drapeaux sans table — table ${numTab} (${numEnv ? 'éditeur' : 'runtime'}) non chargée`));
    //  L'ENVIRONNEMENT vient du SIGNE — plus d'espace positionnel, plus de checkEspace :
    //  un attribut ne PEUT PLUS être « écrit dans le mauvais espace ».
    const contexte = { piece, contenant: numEnv ? piece.editor.attrs : piece.attrs,
                       endOut: t => t.val === ',' || t.val === ';' };   // clôtures EXTERNES d'une valeur d'attribut — la SÉRIE les consomme

    for (let i = 0, bit = 1; noms && i < noms.length; i++, bit *= 2)   // DRAPEAUX nus
      if (code & bit) TsiAttr.set(TsiAttrsBuilder.strip(noms[i]), TSI_TRUE, contexte);   // l'entête true__ tombe ICI

    while (tk.at(',')) {                           // `, entrée` répété
      tk.next();
      TsiAttrsBuilder.buildEntree(tk, noms, contexte);
    }
    if (tk.at(';')) tk.next();                     // la série se ferme
  }

  /** UNE entrée — deux écritures, une même suite. */
  static buildEntree(tk, noms, contexte) {
    const t = tk.next();
    let nom;
    if (t.type === 'number') {                                   // COMPRESSÉE : pos → nom
      nom = noms?.[Number(t.val)];
      if (nom === undefined)
        throw new Error(TsiTokenizer.posError(tk.str, t.pos,
          `attribut : position ${t.val} hors de la table (${noms?.length ?? 0} noms)`));
      nom = TsiAttrsBuilder.strip(nom);                          // l'entête true__ tombe ICI (drapeau à règles : entrée nue)
    } else if (t.type === 'attr') {                              // MANUELLE : le nom dit lui-même
      nom = t.val;
    } else {
      throw new Error(TsiTokenizer.posError(tk.str, t.pos, `attribut : position ou $$nom attendu`));
    }
    let rules = null;
    if (tk.at('~<')) {                             // règles de l'OCCURRENCE — le
      rules = new (o_.attrBehavior[nom]?.rulesClass ?? TsiEditorAttrRules)();   // vocabulaire vient du
      rules.build(tk);                                           // COMPORTEMENT, pas de l'espace
    }
    if (!tk.at('=')) {                             // pas de '=' → DRAPEAU
      TsiAttr.set(nom, TSI_TRUE, contexte, rules);
      return;
    }
    tk.next();                                                   // '='
    //  Valeur = tsiValue ORDINAIRE. Un tableau est CROCHETÉ : il se ferme sur son
    //  ']' apparié, la virgule suivante est donc TOUJOURS un séparateur d'entrée.
    //  (Mort de buildTsiValueWithComa, la levée d'ambiguïté par regard en avant.)
    TsiAttr.set(nom, TsiVal.aiguillage(tk, contexte.piece, contexte), contexte, rules);   // ⚠ coupe 26/08 — même parsing partout
  }
}


class TsiAttrProducer{
  // (Les quatre lecteurs de l'ANCIENNE zone — buildAttr, buildTsiValueWithComa,
  //  checkEspace, CompilePieceAttrs — sont SUPPRIMÉS (2026-08-13) : la zone codée
  //  se lit désormais par TsiAttrsBuilder (séries signées, tables-véhicule), et
  //  l'ambiguïté de la virgule est morte avec les tableaux CROCHETÉS. La classe
  //  ne garde que son rôle de PRODUCTEUR : le comportement d'un attribut.
  constructor(name, editor = false, rulesClass = TsiEditorAttrRules){
      this.name   = name;
      this.editor = editor;                              // CONTRÔLE d'espace (plus d'aiguillage : le placement est positionnel)
      // Le SITE d'un bloc `~<…>` n'est pas « les attributs » mais CET attribut :
      // chacun déclare le vocabulaire qu'il admet. Défaut = type + doc ; un
      // attribut à vocabulaire propre (ex. $$compressed et ses constantes de
      // moment) passe SA classe — les autres n'en héritent pas.
      this.rulesClass = rulesClass;
  }
  init(tsiValue, piece, startCtx){}                         // PHASE A — startCtx = contexte du START, PAS le ctx de compilation
  css(div){}
}

/**
Note TsiVarSlot supprimé, c'est TsiVarDecl initialisé à undefined
---
Modification : le contexte avec des noms => HEADER, TRACKS, VALUE (keyValue ou transitValue seront traités de la même façon) 


---

Autre aiguillage de comportement de variable : le contenu, la valeur.

Exemple : 
- à la compilation de variable en entête de Piece
     -  := pipe => mémorise 'nomVar'
     - := déclaration => mémorise var+value tel que (agnostique) ou null
     - = publish => envoie la valeur dans la déclaration. mémorise script "nomVar=value;" pour exporte    
     - = reader => récupère la valeur dans la déclaration => execute la valeur (ex : insert script entre balise $var)

---
---

ctx [situation, contenant]
- situation : HEADER/TRACKS/VALUE
- contenant : Piece timebar track keyValue (pour l'instant)

Note : piece et ctx sont passé lors de la construction à TsiVal

---

timebar : car les sscripts de piste sont dans la table de timebar 
track : car les scripts de keys sont dans la piste

Note : ceci est définit à la lecture du script dans "valeur"
Si dans header ou tracks
   - si script commence par '&' => liste de pistes => container = <Piece>.timeBar
   - sinon => liste de keys => container = <Piece>.timeBar.track[i]
   Note : cette distinction se calcule dans le constructeur de TsiValStript

*/


// ═════════════════════════════════════════════════════════════
//  ATTRIBUTS DE PIÈCE — état PERMANENT (runtime + éditeur)
// ═════════════════════════════════════════════════════════════
//  ATTRIBUTS — deux registres SÉPARÉS (PD) :
//   • o_.attrBehavior : le COMPORTEMENT par nom { css?, editor? } — stable, dans le
//     moteur. `css` = traduction appliquée au style en PASSE A ; `editor:true` =
//     famille ÉDITEUR (répartie dans le 2e segment binaire). Le nom est l'identité.
//   • la table bit↔nom N'EST PLUS FIGÉE ici : elle est ENGENDRÉE par document à la
//     sauvegarde (TsiAttrSaver, tispiParser.js — bit = puissance de 2 assignée au
//     fil des attributs présents) et PUBLIÉE dans le fichier (o_.projet.attrsCode).
//     Un document est ainsi AUTO-DÉCRIT : un vieux fichier se relit via SA table,
//     un attribut neuf ne fige rien. (Un nombre binaire écrit à la main, sans table
//     publiée, est muet — les pages s'écrivent en forme développée `$$nom`.)
o_.attrBehavior = {                                    // clés = noms AVEC sigil `$$` (cf. règle des noms)
  // TABLE DE PRODUCTEURS (modèles PARTAGÉS, sans état d'occurrence). Un attribut
  // à COMPORTEMENT = une sous-classe de TsiAttrProducer (posée plus bas) ; un
  // attribut-ÉTAT pur = un TsiAttrProducer nu (sa présence dans piece.attrs
  // suffit aux lecteurs). 2e arg true = famille ÉDITEUR (contrôle d'espace au parse).
  $$overToTop:       new TsiAttrProducer('$$overToTop'),               // survol → sommet du groupe (câblé)
  $$dragToDrop:      new TsiAttrProducer('$$dragToDrop'),              // paramétré : noms des zones de drop
  $$isDrop:          new TsiAttrProducer('$$isDrop'),                  // paramétré : nom de LA zone de drop
  $$indexed:         new TsiAttrProducer('$$indexed'),                 // membre d'une suite indexée
  // COPIES du nœud : `$$copyNode = <nombre>, <arrangement>;`. Le moteur construit
  // les copies, NOMMÉES par indice (myPiece_0_, myPiece_1_…) — donc adressables
  // par le joker (`this.myPiece_$_$_`) ; les variables à zone d'indice
  // (`$prix_$_$_`) s'y distribuent. Espace RUNTIME : le développé le porte, la
  // construction le consomme.
  $$copyNode:        new TsiAttrProducer('$$copyNode', false, TsiEditorCopyNodeRules),
  $$autonomous:      new TsiAttrProducer('$$autonomous'),              // BRANCHE AUTONOME : barrière de résolution des variables (modules FERMÉS par défaut, sponge:true ouvre)
  $$openDefaultValue: new TsiAttrProducer('$$openDefaultValue'),       // OUVERTURE (PD 14/10) : 1 = l'export écrit les défauts `<$$default = …>`, 0 = la dernière sauvegarde ; porté par la descente (TsiBuild)
  $$commentaire:     new TsiAttrProducer('$$commentaire',    true),    // commentaire de Pièce (éditeur)
  $$filtreEditFace:  new TsiAttrProducer('$$filtreEditFace', true),    // (éditeur)
  $$filtreEditPos:   new TsiAttrProducer('$$filtreEditPos',  true),    // (éditeur)
  // COMPRESSION : ce nœud porte une collection — son bloc dit QUAND les clones
  // naissent (RUN_TIME / EDIT) et, à venir, comment ils se nomment et se placent.
  // Espace ÉDITEUR : le compressé est une vue, jamais exécuté (le DOM n'en ferait rien).
  // ⚠ SANS RAPPORT avec le chantier EXPOSITION ci-dessous ($$rootCompressed/$$xl) —
  //   deux notions sous un mot : collision de vocabulaire EN ATTENTE d'arbitrage PD.
  $$compressed:      new TsiAttrProducer('$$compressed', true, TsiEditorCompressedRules),
  // ── EXPOSITION SIMPLIFIÉE (PD 2026-08-19/20) — deux DRAPEAUX-ÉTAT nus : la
  //   présence suffit, aucun comportement, rien de stocké ailleurs (root et handler
  //   se CALCULENT à la construction de la vue). Cf. fiche exposition/compression.
  $$rootCompressed:  new TsiAttrProducer('$$rootCompressed'),           // sur une PIÈCE : l'auteur déclare une unité compressable
  $$xl:              new TsiAttrProducer('$$xl'),                       // « lock extended » : ce composant reste MANIPULABLE dans la vue
  $$mod:             new TsiAttrProducer('$$mod'),                      // posé PAR LE TRAITEMENT dans la vue : composant modifié ou créé —
                                                                        //   le chemin retour n'applique QUE les porteurs de ce drapeau
};

class TsiAttrPosrelative extends TsiAttrProducer {
  init(tsiValue, piece, startCtx) { piece.div.style.position = 'relative'; }
  //css(div) { div.style.position = 'relative'; }
}
o_.attrBehavior.$$posRelative = new TsiAttrPosrelative('$$posRelative');

class TsiAttrAscenseur extends TsiAttrProducer {
  init(tsiValue, piece, startCtx) { piece.div.style.overflow = 'auto'; }
  //css(div) { div.style.overflow = 'auto'; }
}
o_.attrBehavior.$$ascenseur = new TsiAttrAscenseur('$$ascenseur');


//  LA PIÈCE NE REÇOIT AUCUN ÉVÉNEMENT DE POINTEUR — clic, survol, appui la TRAVERSENT
//  et atteignent ce qui est dessous (`pointer-events: none`). Renommé depuis
//  `$$invisibleSouris` le 2026-08-23 (PD) : aucune page ne l'employait.
//  ⚠ `$$drag` pose l'inverse (`pointer-events: auto`) : sur une même Pièce, le
//  dernier attribut initialisé l'emporte.
class TsiAttrNoMouse extends TsiAttrProducer {
  init(tsiValue, piece, startCtx) { piece.div.style.pointerEvents = 'none'; }
  //css(div) { div.style.pointerEvents = 'none'; }
}
o_.attrBehavior.$$noMouse = new TsiAttrNoMouse('$$noMouse');



//  BOUTON — le comportement souris de la piste `&button`, en ATTRIBUT (PD 2026-08-21).
//  La Pièce devient son propre plateau d'états : le survol, l'appui et le relâchement
//  la positionnent sur les frames 0 / 1 / 2 de SON plateau porteur.
//      mouseenter → 1 (survolé)   mousedown → 2 (appuyé)   mouseleave → 0 (normal)
//  Ce que les frames CONTIENNENT ne regarde pas le bouton : pistes décoratives sur la
//  Pièce, ou faces entières (`&face 0:f0; 1:f1; 2:f2`) — une seule écriture couvre les
//  deux natures.
//  ⚠ ISOLATION : ces gotoStopGroup figent le plateau PORTEUR. Pour ne pas geler des
//  frères, brancher la Pièce-bouton dans un plateau qui lui est propre (la face-groupe
//  d'une Pièce parent) — zéro mécanisme dédié, cf. `&clock 0:stop`.
//  ⚠ ÉQUIVALENT à `&button`, PAS un doublon inutile : la piste ne servait QUE de
//  support aux listeners (son css a `setCss = () => {}`, aucune sortie CSS, et ses
//  keys ne sont jamais lues). Un comportement n'a pas besoin d'une piste de TEMPS —
//  l'attribut le dit mieux. Corps repris de TsiNodeBuilder.postBuild.button.
class TsiAttrButton extends TsiAttrProducer {
  init(tsiValue, piece, startCtx) {
    //  DÉLÉGATION AU RÔLE (PD 2026-08-22) : l'attribut est la forme NUE du contrôle —
    //  le rôle nu + la table implicite (0:OUT; 1:OVER; 2:PUSHED). Une piste &button a
    //  câblé au BUILD, avant ce start ? le drapeau est levé, on s'abstient (l'alerte
    //  de double écriture a été émise là-bas).
    if (piece._btWired) return;
    const css = new TsiCssButton(piece);
    css.buildStates(null, piece);              // aucune key → l'implicite
    css.initMouse(piece);
  }
}
o_.attrBehavior.$$button = new TsiAttrButton('$$button');


class TsiAttrDrag extends TsiAttrProducer {
  init(tsiValue, piece, startCtx) {
    TsiDomListener.add(piece, piece.div, 'mousedown', () => TsiDrag.attach(piece));
    TsiDomListener.add(piece, piece.div, 'mouseup',   () => TsiDrag.detach(piece));
    piece.div.style.pointerEvents = 'auto';
  }
  //css(div) { div.style.pointerEvents = 'auto'; }
}
o_.attrBehavior.$$drag = new TsiAttrDrag('$$drag');



// Devenu inutile : le code de la famille est publié dans le fichier (o_.projet.attrsCode) et
//  Segments binaires → UN champ nommé `piece.attr` (runtime + éditeur fusionnés :
//  le nom suffit, l'identité n'a pas besoin de la famille au runtime). La table
//  bit↔nom vient du fichier (o_.projet.attrsCode), inversée par famille.
/*
Tsi_.decodeAttrs = function (segments) {
  const code = o_.projet?.attrsCode || { runtime: {}, editor: {} };
  const inv  = (fam) => { const m = {}, t = code[fam] || {}; for (const n in t) m[t[n]] = n; return m; };
  const byBit = [inv('runtime'), inv('editor')];       // segment 0 → runtime, 1 → éditeur
  const attr  = {};
  segments.forEach((seg, i) => {
    const map = byBit[i];
    if (!map) { TsiError.warning('attributs : segment surnuméraire ignoré.'); return; }
    for (let b = 1; b <= seg.flags; b *= 2)            // les flags du nombre → true
      if ((seg.flags & b) && map[b]) attr[map[b]] = true;
    for (const e of seg.entries) {                     // code:texte, ou nom nu (développé)
      if (e.code != null) {
        if (map[e.code]) attr[map[e.code]] = e.text;
        else TsiError.warning('attribut : code inconnu ' + e.code);
      } else if (e.name) attr[e.name] = e.text;
    }
  });
  return attr;
};
*//** LA table de variables d'un porteur — UNE classe, posée sur chaque type de
 *  composant (TsiPiece, TsiFace, TsiKey ; TsiTrack, TsiCssBase… à venir).
 *  La mécanique (table, add/set/suppr) est commune ; l'EFFET du porteur
 *  (poser la custom property qualifiée au bon endroit) est le CALLBACK onSet,
 *  appelé à la déclaration d'une valeur et à chaque affectation. */
//  COLLECTION nom → TsiVar. Map, et non Array : la clé est un NOM (`$v$$`), pas
//  un rang. Sur un Array une propriété nommée ne compte pas dans `length` et
//  `for…of` ne la voit jamais — la table paraîtrait vide (mesuré).
//  De Map viennent, avec exactement le sens voulu : has · get · delete · keys ·
//  values · size. Deux verbes RESTENT à nous, parce que Tispi leur donne un sens
//  que Map n'a pas :
//     put   RANGER une entrée — le `set` de Map, renommé pour libérer le nom ;
//     set   AFFECTER la valeur d'une variable DÉJÀ déclarée (sens Tispi), avec
//           l'effet du porteur (onSet).
//  ⚠ `for…of` sur une Map rend des PAIRES [nom, var] : parcourir les variables
//    s'écrit `vars.values()`.
class TsiVars extends Map {
  constructor(onSet) { super(); this.onSet = onSet ?? null; }
  put(nom, entry) { super.set(nom, entry); return entry; }   // RANGEMENT pur, sans effet
  names()         { return [...this.keys()]; }
  /** Déclare : entry = { kind?, value, … } — l'effet ne joue que pour une VALEUR. */
  add(nom, entry) {
    this.put(nom, entry);
    if (entry.kind === undefined || entry.kind === 'value') this.onSet?.(nom, entry.value, entry);
    return entry;
  }
  /** Affecte (valeurs seulement — les références naissent par ':= this'/'= this'). */
  set(nom, value) {
    const e = this.get(nom);
    if (!e) TsiError.error(`variable $${nom} : absente de cette table`);
    e.value = value;
    this.onSet?.(nom, value, e);
    return value;
  }
  suppr(nom) { const e = this.get(nom); this.delete(nom); return e; }
}

/** SURCHARGE pour la KEY DE PISTE D'ÉTAT (TrackFormat.STATE — la face en tête ;
 *  idée PD) : rien à transporter par le CSS — la valeur de la variable EST
 *  l'état de la key. L'affectation = vérité + key + REPRISE du comportement
 *  en cours (_regoto : le swap rejoue si la key est courante, fondus normaux ;
 *  sinon rien — la prochaine arrivée lira la nouvelle valeur). */
class TsiVarsKeyFace extends TsiVars {
  constructor(key, track) { super(null); this.key = key; this.track = track; }
  add(nom, entry) { this.put(nom, entry); this.key.value = entry.value; return entry; }
  set(nom, value) {
    const e = this.get(nom);
    if (!e) TsiError.error(`variable $${nom} : absente de cette table`);
    e.value = String(value);
    this.key.value = e.value;
    this.track._regoto();
    return value;
  }
}

/** Nom CSS qualifié d'une variable : le contexte = l'idUnic du DÉCLARANT. */
Tsi_.varCssName = (declarant, nom) => `--tsi${declarant.idUnic.uid}-${nom}`;

/** Pose la custom property (entière + composantes -0,-1,… pour les tuples —
 *  consommées par les varValue() en calc(var(…-i) * 1px)). */
Tsi_.setVarProperty = function (declarant, nom, value) {
  const q = Tsi_.varCssName(declarant, nom), st = declarant.div.style;
  st.setProperty(q, value);
  String(value).split(',').forEach((part, i) => st.setProperty(`${q}-${i}`, part.trim()));
};


// ═══ MORT — réification des variables (2026-07) ═══════════════════════════════
// L'ancien traitement `{kind, value}` de la zone de tête est REMPLACÉ par les
// classes TsiVar : le parseur construit les instances (Decl/Slot/Pipe/Pub/Reader)
// via `TsiVar.c ompileClass`, et `c ompile()` (tispiParser.js) les applique par
// `v.apply(el._tsi)` — chaque forme s'inscrit elle-même (fin du dispatch sur `kind` ;
// `apply` s'appuie sur `TsiNode.ensureVars()`). Conservé commenté pour référence :
//
// Tsi_.applyVarDecls = function (piece, decls) {
//   for (const d of decls) {
//     if (d.kind === 'pub') {                        // $nom = this; — la Pièce SE PRÉSENTE chez le déclarant
//       const r = TsiVar.resolveVar(piece, d.nom);
//       if (!r) TsiError.error(`variable $${d.nom} : publication sans déclarant (…)`);
//       r.entry.value = piece;                       // référence : pas d'effet CSS (hors callback)
//       (piece._varPubs ??= []).push(d.nom);         // provenance du PUBLIANT (export)
//       continue;
//     }
//     piece.vars ??= new TsiVars((nom, v) => Tsi_.setVarProperty(piece, nom, v));
//     piece.vars.add(d.nom, {
//       kind: d.kind,
//       value: (d.kind === 'value' || d.kind === 'script') ? d.src : d.kind === 'self' ? piece : null,
//       readers: [],
//     });
//   }
// };

/** Lecture (JS / paths) : valeur ou référence, résolue à l'appel. */
o_.getVar = function (piece, nom) {
  return TsiVar.resolveVar(piece, nom)?.entry.value;   // nom garde son $ (règle sigil) — resolveVar ajoute lui-même le suffixe $$
};

/** Affectation runtime (geste) : table du déclarant + setProperty — le
 *  navigateur propage à tous les lecteurs var() (AUCUNE reconstruction — PD).
 *  Réservée aux VALEURS (les références naissent par ':= this' / '= this'). */
/** Affectation ADRESSÉE (`pathPiece.$nom = …`) : BALAYAGE TOTAL de la Pièce
 *  ciblée (PD) — TOUTES les variables de ce nom rencontrées reçoivent la
 *  valeur (keys de toutes les pistes + zone de tête). SANS remontée : c'est
 *  une adresse, pas une portée — aucune trouvée = erreur. */
o_.setVarIn = function (piece, nom, value) {
  const decl = nom + '$$';                          // clé de DÉCLARATION (nom garde son $ ; suffixe $$ comme resolveVar l.64)
  let servies = 0;
  for (const t of (piece.timeline?.tracks ?? []))
    for (const k of t.keys)
      if (k.vars?.has(decl)) { k.setVar(decl, value); servies++; }
  if (piece.vars?.has(decl)) { piece.vars.set(decl, value); servies++; }
  if (!servies)
    TsiError.error(`${nom} : la Pièce #${piece.div?.id ?? '?'} ne déclare pas cette variable (ni key, ni zone de tête)`);
  return value;
};

o_.setVar = function (piece, nom, value) {
  const r = TsiVar.resolveVar(piece, nom);           // nom garde son $ (règle sigil)
  if (!r) TsiError.error(`setVar : variable ${nom} sans déclarant depuis #${piece.div?.id ?? '?'}`);
  r.entry.readers = r.entry.readers?.filter(o => o.track?.piece?.div?.isConnected);   // purge au tir (auto-nettoyage)
  return r.declarant.vars.set(r.entry.nom, value);   // clé RÉELLE de la déclaration ($nom$$) ; vérité + onSet du porteur
};

//  (Tsi_.applyAttrCss SUPPRIMÉE 2026-08-06 — remplacée par TsiAttr.initAll,
//   phase A : les PRODUCTEURS installent leurs comportements. Cf. tispiVar.js.)

// ═════════════════════════════════════════════════════════════
//  CUSTOM ELEMENTS  —  <tsi-p> <tsi-f> <tsi-pf>
// ═════════════════════════════════════════════════════════════
/**
 * Chaque élément se construit EN PLACE pendant le parsing, via son
 * connectedCallback (appelé par le navigateur à la rencontre de la balise,
 * dans l'ordre de l'arbre, parent avant enfant). Remplace les <script>
 * inline + o_.div(). Construction seule — l'activation reste à o_.start().
 *
 * Le nom de classe est sans importance (classe anonyme) ; seul le TAG compte
 * (tiret obligatoire). data-tsi est lu sur l'attribut (les enfants ne sont pas
 * encore parsés au connectedCallback — sans incidence : la construction n'en
 * a pas besoin). Source script-enfant non disponible ici → attribut data-tsi.
 */


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiBuild.js  (1834 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * {@link TsiNodeBuilder} : construction directe d'une piste (fusion de _track + buildTrack).
 *   {@link TsiNodeBuilder.build()} Construction directe d'une Pièce ou d'une Face (fusion de buildParse + build).
 *     {@link TsiNodeBuilder.buildHead()} Construction directe de la tête - attributs + variable - d'une Pièce ou d'une Face (fusion de buildText + build).
 *       {@link TsiVar.buildClass(tk: any, piece: any, ctx: any)} Construction directe d'une variable (fusion de buildVar + buildClass).
 *         {@link TsiVar._buildClass(tk: any, piece: any, ctx: any): TsiVarSet | TsiVarPipe | TsiVarDecl | TsiVarGet} - différencie ':=' '=' et ';').
 *             TsiVal._buildClass(tk: any, piece: any, ctx: any): TsiVal | TsiValConst | TsiValMacro | TsiValExpr | TsiValList | TsiValMap
 *     {@link TsiPieceBuilder.openTimelines(): void} Construction directe des timelines d'une Pièce (fusion de _readTracksInto + build).
 *     {@link TsiFaceBuilder.openTimelines(): void} Construction directe des timelines d'une Face (fusion de _readTracksInto + build).
 *     {@link TsiNodeBuilder.buildTracks(): void} Construction directe des pistes d'une Pièce ou d'une Face (fusion de _readTracksInto + build).
 *     {@link TsiPieceBuilder.finish(): void} Montage final d'une Pièce (fusion de _readTracksInto + build).
 *     {@link TsiFaceBuilder.finish(): void} Montage final d'une Face (fusion de _readTracksInto + build).
* {@link TsiNodeBuilder.buildKeys()} Construction directe des keys d'une piste (fusion de _buildKeys + buildTrack).
* 
* TsiVal : construction directe d'une valeur (fusion de buildVal + buildClass).
* {@link TsiVal._buildClass(tk: any, piece: any, ctx: any): any} Construction directe d'une valeur (fusion de buildVal + buildClass).
 
*/


// ═════════════════════════════════════════════════════════════════════════════
//  tispiBuild.js — LE BUILD : construction directe + préparation du start.
//  (docs/CONSTRUCTION_DIRECTE.md)
// ═════════════════════════════════════════════════════════════════════════════
//  Balayage UNIQUE : tokenizer (conservé) → objets Tispi. AUCUNE table plate.
//
//  HIÉRARCHIE DE BUILDERS (PD 2026-08-05) — le comportement GÉNÉRAL dans le
//  parent, le SPÉCIFIQUE dans les enfants, par MÉTHODES-CROCHETS vides au parent
//  (appel inconditionnel, implémentation variable — ex. buildOut) :
//
//      TsiBuilder                 le walk commun (tête, pistes, keys) + helpers
//      ├─ TsiPieceBuilder         timeline unique + membrane de plateau
//      │  ├─ TsiPieceFaceBuilder  (tsi-pf — spécifique futur)
//      │  └─ TsiPieceGroupBuilder (tsi-pg — spécifique futur)
//      └─ TsiFaceBuilder          split in/out, 2 timelines, durées locales
//
//  Branchement (tispi001 l.5051) : tsiTag → new TsiXxxBuilder(objetTispi) — le
//  TAG choisit le builder (plus aucun routage par nature dans le code) ; le
//  CTOR fait le build (isolation par élément intégrée).
//
//  Provenance des copies (originaux intacts jusqu'au nettoyage final) :
//    class TsiBuild (phase A start)  ← DÉPLACÉE de tispi001 l.3976-4061
//    safeCompile             → TsiBuilder ctor    (tispi001 l.5097-5121)
//    build(el)             → TsiBuilder.run     (tispiParser l.910-921)
//    buildText (TÊTE)      → buildHead          (tispiParser l.714-751)
//    _readTracksInto         → buildTracks        (tispiParser l.765-784)
//    _track                  → buildOneTrack      (tispiParser l.976-1013)
//    _buildKeys            → buildKeys          (tispiParser l.1017-1232)
//    TsiTrack ctor (init)    → allocTrack (SUPPRIMÉE 2026-08-13 : `new CssClass.track(prop, piece)`)
//    TsiTrackClock.buildTrack (config/durée/pseudo)     (tispi001 l.1966-2003)
//    TsiTimeline ctor (dédup) → TsiPieceBuilder.placeTrack  (tispi001 l.2279-2299)
//    TsiFaceDom.buildParse   → TsiFaceBuilder     (tispi001 l.3007-3071 : split
//      in/out par bascule du walk, filtre Pièce>Face, animDuration/durOut, _inheritPrev)
//    ctors actifs button/drag/videoSynchro → postBuild (tispi001 l.4522-4548, 4623-4627, 4729-4733)
//    helpers Tsi Compiler     → statics de TsiBuilder    (tispiParser + tispi001 l.4429-4434)
//
//  Appelé SANS copie : StiTokenizer (le SEUL survivant prévu de tispiParser),
//  TsiMacroOpen/Close (encore dans tispiParser — migreront ici à sa suppression),
//  TsiAttrProducer.CompilePieceAttrs, TsiVar.buildClass, TsiVal.buildClass,
//  TsiEffect / TsiHideEffect / TsiInterpolation (.build), TsiValConst, TsiError, TsiLang,
//  TsiTrackClock.{setPlateDurationTempo,addPieceToPlate}, Tsi_.makeGenericCss.
//
//  CHARGEMENT : après tispi001.js + tispiVar.js — OBLIGATOIRE dans chaque page
//  (construction ET phase A du start vivent ici).
//
// Ctrl+Shift+E et Ctrl+Shift+D :1425 et :1433. 
// ═════════════════════════════════════════════════════════════════════════════


// ═════════════════════════════════════════════════════════════════════════════
//  TsiBuild — PHASE A : PRÉPARATION DU START (déplacée de tispi001 l.3976-4061,
//  telle quelle). Aucune Face affichée, aucun timer, plateaux figés à frame -1.
//  L'horloge vit dans la Pièce (get-or-create via le contexte) ; chaque Face est
//  une frontière d'horloge indépendante (pile dans le CONTEXTE). Fonctions
//  ISOLÉES → réutilisables par les outils d'édition (addElement…).
//  L'activation (apparition + play) est la phase B (setActive), séparée.
// ═════════════════════════════════════════════════════════════════════════════
class TsiBuild {

  static createStartContext() {
    return { clockCurr: null, stack: [], openDefault: false, openStack: [] };   // openDefault : $$openDefaultValue reçu dans la descente (PD 14/10)
  }

  // clockTempo → TsiTrackClock, posé en état INACTIF (frame -1).
  static consumeClockTempo(tempo) {
    if (!tempo) return null;                                  // pas de plateau → null (statique)
    if (!tempo.ptClock) tempo.ptClock = TsiTrackClock.createClock(tempo.div, null, tempo.animDuration);  // horloge implicite (boucle) — durée par le canal !<durée:>
    const clock = tempo.ptClock;
    // Règle d'allongement, JAMAIS de rétrécissement : l'accumulateur du tempo
    // ne peut qu'ÉTENDRE une durée déclarée sur l'horloge (!<50:> survit à un
    // contenu qui s'arrête à 41 — la durée est un état, pas un cache).
    clock.animDuration = Math.max(clock.animDuration ?? 1, tempo.animDuration ?? 1);
    TsiBuild.prepareClockState(clock);
    return clock;
  }

  // État précédant toute activation : stop figé à -1, aucun timer.
  static prepareClockState(clock) {
    if (!clock) return;
    clock.started   = false;
    clock.frameStop = -1;
    clock.dateStart = null;
    clearTimeout(clock._loopTimer); clock._loopTimer = null;
    clock.clearTimers?.();
  }

  static prepareRoot(rootDiv, ctx) {
    const tempo = TsiTrackClock.getDivClockTempo(rootDiv);    // plateau racine (body)
    rootDiv.clockTempo = null;                                // consommé
    return ctx.clockCurr = TsiBuild.consumeClockTempo(tempo);
  }

  // onEnterFace — ouvre la frontière d'horloge de la Face : pose le contexte
  // d'horloge pour ses Pièces ENFANTS (group). Ne bâtit RIEN de la face elle-même :
  // son effet IN/OUT est clock-free → construit à l'apparition (onShow → playTrack),
  // pas en A (timelineOut idem : runtime/playOut).
  static prepareFace(face, ctx) {
    ctx.stack.push(ctx.clockCurr);
    TsiBuild.openDefaultEnter(face, ctx);                     // $$openDefaultValue sur une Face (tsi-g racine) : même geste
    TsiAttr.initAll(face, ctx);                               // ATTRIBUTS de FACE : mêmes producteurs, même phase (TOUTES les faces, avant le return des non-groupes)
    //  Le MÉDIA de la Face (&videoSynchro, &sliderSynchro) se construit ICI, arbre complet : un <video> ou un
    //  <input type="range"> écrit dans la Face est trouvé. À la connexion il n'existait pas encore (S-1, PD 11/10).
    for (const track of face.timeline?.tracks ?? []) track.css.setup?.(track);
    if( !(face instanceof TsiGroup)) return 'continue';
    // Le tempo = MÉMORISATION TEMPORAIRE du parsing, garée sur la div du
    // faceGroup — une face ne possède JAMAIS d'horloge : l'horloge finale est
    // une piste de PIÈCE du plateau (une &clock élue, ou la Pièce __clock__
    // que consumeClockTempo insère). Un plateau dont aucune Pièce n'a de piste
    // (hôtes de module nus) n'a pas créé ce parking → le créer ici s'il y a
    // des Pièces enfants, même règle que la racine (prepareRoot).
    const hasPieces = [...face.div.children].some(c => c._tsi);
    const tempo = face.clockTempo ?? (hasPieces ? TsiTrackClock.getDivClockTempo(face.div) : null);
    face.clockTempo = null;                                   // consommé
    ctx.clockCurr = TsiBuild.consumeClockTempo(tempo);        // horloge du plateau des Pièces enfants ; null si pas de plateau
    return "continue";
  }

  // onExitFace — dépile l'horloge.
  static faceQuit(face, ctx) {
    ctx.clockCurr = ctx.stack.pop();
    TsiBuild.openDefaultQuit(face, ctx);
    return "continue";
  }

  //  $$openDefaultValue (PD 14/10) — « on empile quand le flag est rencontré en descente, on dépile en remontant au niveau
  //  de ce même flag ». 1 = ouvrir avec les défauts, 0 = avec la dernière sauvegarde ; le drapeau nu vaut 1 (`false` n'est
  //  pas exporté, d'où 0/1). Chaque nœud GARDE la valeur reçue (node.openDefault) : l'export la lit sur place
  //  (TsiVarDecl._exportValue), la descente n'est pas refaite.
  static openDefaultEnter(node, ctx) {
    const o = node.attrs?.['$$openDefaultValue']?.get();
    if (o) { ctx.openStack.push(ctx.openDefault); ctx.openDefault = !!o.get(); }
    node.openDefault = ctx.openDefault;
  }
  static openDefaultQuit(node, ctx) {
    if (node.attrs?.['$$openDefaultValue']) ctx.openDefault = ctx.openStack.pop();
  }
  // onExitPiece — jusqu'ici non servi par le start (null) : la sortie de Pièce dépile le flag.
  static pieceQuit(piece, ctx) {
    TsiBuild.openDefaultQuit(piece, ctx);
    return "continue";
  }

  // onEnterPiece — l'horloge vit ici (transmise par le contexte).
  static preparePiece(piece, ctx) {
    piece.ensureFaceTrack();                                  // &face implicite (DOM complet)
    TsiStart._checkFaceIds(piece);                            // &face → id de face existant ? (warning)
    piece.ptClock = ctx.clockCurr;                            // peut être null (Pièce statique)
    TsiBuild.openDefaultEnter(piece, ctx);                    // $$openDefaultValue : flag rencontré → empile, pose ; le nœud garde la valeur reçue
    TsiAttr.initAll(piece, ctx);                              // ATTRIBUTS : les producteurs installent leurs comportements (arbre + horloge disponibles)
    piece.ptClock?.clockSlave?.resolveAndAttach();            // liaison LOCALE : clockMaster(name) résout ici (ancêtre déjà préparé) ; clockFace défère à onShow
    return "continue";
  }
  // NB : plus de pré-construction d'animate en Phase A (ex-prepareTimeline/
  // prepareTrackAnimation retirées) — les animates sont désormais LAZY, bâtis au
  // 1ᵉʳ play (gotoPlay → _animSeek → playTrack). Cf. build-once.
}


// ═════════════════════════════════════════════════════════════════════════════
//  TsiTransitionBuilder — LE CONSTRUCTEUR DE TRANSITIONS (étape E-2, PD 28-30/09).
//  Contrat commun à tous les lecteurs de chevron : ENTRÉE le curseur est sur '<', SORTIE sur le jeton qui suit '>'.
//  La nature se décide sur le signe, AVANT toute construction : une durée en tête = effet, sinon interpolation.
//  Le CONTENU du chevron est lu ici aussi, par `_transition` (étape E-2b) : `<durée:accélération,effet,délai:when>`.
// ═════════════════════════════════════════════════════════════════════════════
class TsiTransitionBuilder {

  /** Entrée : sur '<'. La transition commence-t-elle par une durée ? Une durée est UN jeton suivi de ':' ;
   *  `<>` n'en a pas. Rien n'est consommé. */
  static startsWithDuration(tk) { return tk.peekOffset(1).val !== '>' && tk.peekOffset(2).val === ':'; }

  /** Entrée : sur '<'. La place dit ce qu'elle attend, le signe dit ce qu'il y a ; sinon refus, avant toute
   *  construction. Rien n'est consommé. */
  static expectDuration(tk, expected, what) {
    if (TsiTransitionBuilder.startsWithDuration(tk) !== expected)
      throw new Error(TsiTokenizer.posError(tk.str, tk.peek().pos,
        expected ? `${what} : une durée est attendue, <durée:…>`
                 : `${what} : pas de durée — la durée appartient à l'effet d'apparition`));
  }

  /** Entrée : sur '!' s'il y a une transition de tête ; sinon rien à lire.
   *  Sortie : sur le jeton qui suit le dernier chevron lu.
   *  Une TÊTE, div ou piste : l'EFFET puis l'INTERPOLATION, chacun optionnel, dans cet ordre. */
  static buildHead(tk, component, what) {
    if (!tk.at('!')) return;                                            // rien
    tk.next();                                                          // '!'
    if (!tk.at('<')) throw new Error("TsiBuilder : '<' attendu après '!'\n" + tk.toDebug(8));
    if (TsiTransitionBuilder.startsWithDuration(tk)) {                  // `<durée:…>` : l'effet
      component.effect = TsiEffect.build(tk);
      if (!tk.at('!')) return;                                          // l'effet seul
      tk.next();                                                        // '!'
      if (!tk.at('<')) throw new Error("TsiBuilder : '<' attendu après '!'\n" + tk.toDebug(8));
    }
    TsiTransitionBuilder.expectDuration(tk, false, `interpolation ${what}`);
    component.interpolation = TsiInterpolation.build(tk);
  }

  /** Un temps en secondes ou millisecondes (`2s`, `500ms` : token nombre+unité) → frames à la cadence de la page.
   *  Un nombre nu est déjà en frames. Autre chose → null : ce n'est pas un temps. */
  static _timeToFrames(t) {
    if (t.type === 'number') return t.val;
    if (t.type !== 'string') return null;
    const m = /^(-?\d+(?:\.\d+)?)(ms|s)$/i.exec(String(t.val));
    if (!m) return null;
    const ms = Number(m[1]) * (m[2].toLowerCase() === 's' ? 1000 : 1);
    return Math.round(Tsi_.msToFrame?.(ms) ?? ms * 60 / 1000);        // repli : 60 frames par seconde
  }

  /** LE CONTENU d'un chevron (étape E-2b, PD 30/09). Entrée : sur '<', qu'elle consomme. Sortie : sur le jeton qui suit '>'.
   *  Lit `<durée:accélération,effet,délai:when>`, chacun optionnel → [duration, ease, process, delay, when].
   *  RÈGLE DE SÉPARATION (PD) : un temps finit par ':' et sépare tout seul ; tout le reste se sépare par une virgule.
   *  LA PLACE D'UN TEMPS DÉCIDE : avant l'accélération et l'effet, la durée ; après, le délai. Un nombre NU est le `when` :
   *  0 = sauf à l'apparition (défaut) | 1 = à l'apparition seulement | 2 = partout.
   *  L'accélération vient de l'annuaire `TsiValEase_.MOTS` (tispiVar.js) — `fixed` / `_f_` en font partie : la valeur tient. */
  static _transition(tk) {
    tk.next();                               // '<'
    let duration = null, ease = null, process = null, delay = 0, when = 0;
    let needSep = false;
    while (true) {
      const t = tk.peek(true);
      if (t === TsiTokenizer.END) throw new Error("TsiBuilder : '>' attendu\n" + tk.toDebug(8));
      if (t.val === '>') { tk.next(); break; }
      if (t.val === ',') { tk.next(); needSep = false; continue; }
      if (needSep)
        throw new Error(TsiTokenizer.posError(tk.str, t.pos,
          "transition : ',' attendue — seul un temps (suivi de ':') sépare sans virgule"));
      const frames = TsiTransitionBuilder._timeToFrames(t);
      if (frames !== null) {
        tk.next();
        if (tk.at(':')) {                    // un TEMPS — sa place décide : la durée, sinon le délai
          tk.next();                         // ':' — sépare : pas de virgule requise ensuite
          if (duration == null && !ease && !process) duration = frames; else delay = frames;
        } else {                             // un nombre NU : le when
          when = frames;
          needSep = true;
        }
        continue;
      }
      const v = t.val;
      if (v in TsiValEase_.MOTS) { ease = TsiValEase_.MOTS[v]; tk.next(); needSep = true; continue; }
      if (v === '_c_' || v === 'cubicBezier') {   // _c_(a,b,c,d) / cubicBezier(a,b,c,d) → cubic-bezier(…)
        tk.next();
        if (!tk.at('(')) throw new Error("TsiBuilder : '(' attendu après _c_\n" + tk.toDebug(8));
        tk.next();
        const args = [];
        while (!tk.at(')')) {
          const a = tk.next(true);
          if (a === TsiTokenizer.END) throw new Error("TsiBuilder : ')' attendu (_c_)");
          if (a.val !== ',') args.push(a.val);
        }
        tk.next();                           // ')'
        ease = new TsiValCubic(args.map(Number));   // occurrence paramétrée (une par jeu de points)
        needSep = true;
        continue;
      }
      process = v; tk.next(); needSep = true; // sinon : l'EFFET — la fonction qui prend la main (fade, …)
    }
    return [duration, ease, process, delay, when];
  }
}


// ═════════════════════════════════════════════════════════════════════════════
//  TsiBuilder — PARENT : le walk COMMUN. Les points de variation sont des
//  MÉTHODES-CROCHETS (vides ou générales ici, remplies/étendues par les enfants).
//  Le CTOR fait le build : new TsiXxxBuilder(objetTispi) suffit.
// ═════════════════════════════════════════════════════════════════════════════
class TsiNodeBuilder {

  // ── Isolation PAR ÉLÉMENT — SEUL porteur de ce contrat depuis que safeCompile
  //    a été supprimé (2026-08-09) : une erreur de data-tsi est rapportée mais
  //    n'interrompt pas la page (état vide, face statique). Hôte de module COMPRESSÉ : build
  //    DIFFÉRÉ au start (l'expansion retirait data-module puis re-instanciait un
  //    builder). ⚠ Depuis le 2026-08-09 l'expansion est SUSPENDUE : la garde
  //    ci-dessous tient toujours, donc un hôte data-module ne se construit
  //    jamais — c'est le « reste statique » annoncé par l'alerte MODULE SUPPRIMÉ.
  constructor(piece) {
    this.piece = piece;
    this.div   = piece.div;
    if (this.div.dataset?.module) return;
    try {
      this.build();
    } catch (e) {
      try { this.emptyBuild(); } catch (_) {}          // état sain immédiat (ex-buildParse([]))
      // Rapport DIFFÉRÉ au DOMContentLoaded : le source HTML y est lisible →
      // re-build pour rebâtir le message AVEC la bonne ligne (cf. safeCompile).
      const report = () => {
        let m = e.message;
        try { this.build(); } catch (e2) { m = e2.message; }
        console.error(m);
      };
      if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', report, { once: true });
      else
        report();
    }
  }

  // ── Contrat de l'ex-build(el) (tispiParser l.910-921), décodage buildParse
  //    en moins : tête directe, pistes directes, montage par crochets.
  build() {                                            // ex-`run()` — renommé E-1d (29/09) : la convention est `build…`, `run` est le verbe des actions
    const dsl = this.div.dataset.tsi;
    if (!dsl) { this.emptyBuild(); return; }           // pas de data-tsi → état VIDE (build l.913)
    TsiTokenizer._srcCtx = { el: this.div };           // contexte d'erreur HTML (l.915)
    try {
      this.tk = new TsiTokenizer(dsl);
      this.buildHead();                                // TÊTE : options · variables · transitions
      this.openTimelines();                            // CROCHET : réceptacles (Pièce : timeline d'accueil)
      this.buildTracks();                              // PISTES : objets directs
    } finally { TsiTokenizer._srcCtx = null; }
    this.finish();                                     // CROCHET : montage final (membrane / timelines face)
  }

  // ═══ CROCHETS (vides ici — remplis par les enfants) ═══
  emptyBuild()      {}                                 // état sans data-tsi (Pièce : timeline vide)
  openTimelines()   {}                                 // réceptacles avant les pistes
  buildOut()        {}                                 // token 'out' rencontré (Face : bascule du réceptacle)
  finishOneTrack()  {}                                 // fin d'une piste (Face : miroir sur la jumelle OUT)
  placeTrack(track) {}                                 // pose de la piste construite
  finish()          {}                                 // montage final de l'élément



  // 
  //    ####    ####    ###########       #####        ########      
  //    ####    ####    ####             ########      ####  ####  
  //    ####    ####    ####            ####  ####     ####    ####
  //    ############    ########        ####  ####     ####    ####
  //    ####    ####    ####           ############    ####    ####
  //    ####    ####    ####           ####    ####    ####  ####  
  //    ####    ####    ###########    ####    ####    ########    
  // 



  // ── LA TÊTE EST QUATRE ZONES, DANS L'ORDRE, CHACUNE OPTIONNELLE (PD 29/09) : options · variables · transitions · pistes.
  //    Une boucle par zone ; une zone ne lit que ses jetons ; ce qui n'est pas à elle la termine. ──
  buildHead() {
    const tk = this.tk, piece = this.piece;
    piece.vars = new TsiVars(null);                   // ENVIRONNEMENT : table de vars du PORTEUR ; buildClass y AJOUTE
                                                      // _________________________________________________________________________________
                                                      // ATTRIBUTS : la zone codée — séries signées (≥0 runtime, <0 éditeur, code = -n-1),
    TsiAttrsBuilder.buildAttrs(tk, piece);            // décodées contre les tables-VÉHICULE de la page (`X_svg.js`). PIÈCES ET FACES.
                                                      //___________________________________________________________________________
    //  La VALEUR d'en-tête s'arrête (EXTERNE) sur `;` `&…` `!` `@option` ; le `;`, clôture
    //  d'ITEM, est consommé ici. Même suite pour `$nom …` et `mot $nom = …` (étape 2, 08/09).
    const endHead = t => t.val === ';' || t.val === '!' || t.type === 'attr' || t.val[0] === '&';
    const addVar = v => {
      piece.vars.add(v.key, v);                        // le CALLER (zone de tête) inscrit dans la table du porteur — par la CLÉ (Decl/Pipe : nom+'$$')
      v.init();                                        // no-op sauf TsiVarSet (publication) et TsiVarCss (la propriété --nom est posée)
      if (tk.at(';')) tk.next();                       // ';' terminateur de l'item d'en-tête
    };

    // 1 — OPTIONS : `@option = valeur;` tant qu'il y en a — le tokenizer a échangé le sigil (`$$option`)
    while (tk.peek(true).type === 'attr') {
      TsiAttrsBuilder.buildEntree(tk, null,            // le MÊME lecteur que la zone codée (tispiVar.js), table RUNTIME
        { piece, contenant: piece.attrs ??= {}, endOut: endHead });
      if (tk.at(';')) tk.next();
    }

    // 2 — VARIABLES : `let|const|css|letModule|constModule|cssModule $nom …;` et `$nom …;` tant qu'il y en a
    while (true) {
      const p = tk.peek(true);
      if (p !== TsiTokenizer.END && p.type === 'ident' && TsiVar.DECLAR.has(p.val) && tk.peekNext(true).type === 'var') {
        tk.next();                                     // le MOT
        addVar(TsiVar.buildClass(tk, piece, { situation: TsiVar.HEADER, declar: p.val, endOut: endHead }));
        continue;
      }
      if (p !== TsiTokenizer.END && ((p.type === 'var' && tk.peekOffset(1).val === '(' && tk.tokens[tk.peekOffset(1).posPair + 1]?.val === '{')
                                      || TsiValFuncDeclar.match(tk))) {   // `$nom(…){…}` — une fonction locale, à la JS (PD 04/10) ; `function $nom(…){…}` toléré
        TsiValFuncDeclar.build(tk, piece).fromHead = true;   // déposée sur la Pièce, comme dans un bloc ; ré-émise en tête à l'export
        if (tk.at(';')) tk.next();
        continue;
      }
      if (p !== TsiTokenizer.END && p.type === 'var') {   // `$nom = v;` (publication) · `$nom` nu (lecture) · `$nom := …` (forme moteur, dépréciée)
        addVar(TsiVar.buildClass(tk, piece, { situation: TsiVar.HEADER, endOut: endHead }));
        continue;
      }
      break;
    }

    // 3 — TRANSITIONS D'ÉLÉMENT (-3) : l'effet puis l'interpolation, chacun optionnel, dans cet ordre
    TsiTransitionBuilder.buildHead(tk, piece, "d'élément");

    // 4 — les PISTES : buildTracks, appelé par build()
  }

  // ── PISTES — copie-transformée de _readTracksInto l.765-784 : pousse des
  //    pistes CONSTRUITES (placeTrack) au lieu de tables. ──
  buildTracks() {
    const tk = this.tk, piece = this.piece;
    let openMark = null;                               // balise de paramètre <*|nom*> ouverte (zone)
    while (true) {
      const p = tk.peek(true);
      if (p === TsiTokenizer.END) break;
      if (p.val === '&') { tk.next(); break; }         // '&' final : borne de séquence
      if (p.val === ';') { tk.next(); continue; }      // ';' isolé (ex. après `$nom;`)
      if (p.val === '...') {                            // `...$macro` — l'INCRUSTATION d'une macro de pistes (39e, 39g ; étape 5)
        tk.next();                                       // '...'
        const v = tk.peek(true);
        if (v === TsiTokenizer.END || v.type !== 'var')
          throw new Error(TsiTokenizer.posError(tk.str, p.pos, `... : une variable de macro est attendue, ...$nom`));
        TsiNodeBuilder.insertMacro(v, tk, piece, true);  // STRICT : nul = rien d'incrusté ; autre forme = erreur nommée
        continue;
      }
      if (p.type === 'var') {
        const nx = tk.peekNext(true).val;
        if (nx === '<' || nx === '>') { TsiNodeBuilder.macroMark(tk, piece); continue; }   // marqueur splicé → pile
        // Position de PISTE : `$nom` nu est l'OPTIMISATION de `...$nom` (39e) — une valeur ne peut tenir lieu
        // de piste : même incrustation STRICTE (nul = rien, autre forme = erreur nommée).
        TsiNodeBuilder.insertMacro(p, tk, piece, true);
        continue;
      }
      if (TsiNodeBuilder._atMark(tk)) { openMark = TsiNodeBuilder._mark(tk, openMark); continue; }   // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)

      //____________________________________________________________________________________________________________________
      const t = this.buildOneTrack();                  // Construition d'une piste (TsiTrack ou TsiTrackClock) — la piste est posée dans this.track
      if (openMark) this.markTrack(openMark);          // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark) — balise de ZONE
      this.placeTrack(t);                              // CROCHET : pose (Pièce : timeline ; Face : in/out)
    }
    if (openMark)
      throw new Error(`TsiBuilder : balise <*|${openMark}*> jamais fermée\n` + tk.toDebug(8));
  }

  // Balise de ZONE sur la piste courante (général) — la Face ÉTEND (jumelle OUT).
  markTrack(openMark) { this.track.mark = openMark; }   // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)

  // ── UNE PISTE — copie-transformée de _track l.976-1013 FUSIONNÉE avec le corps
  //    de build (TsiTrack.buildTrack l.650-677 ; TsiTrackClock.buildTrack
  //    l.1966-2003). L'état du walk vit sur l'instance (this.track, this.ctx…). ──
  /**
   * Construction d'une piste
   * @returns {TsiTrack|TsiTrackClock} La piste construite
   */
  buildOneTrack() {
    const tk = this.tk, piece = this.piece;
    const head = tk.next(true);                        // '&prop' (_track l.977)
    if (!TsiTokenizer.isAmp(head))
      throw new Error(`TsiBuilder : '&prop' attendu — reçu : ${head.val ?? head}\n` + tk.toDebug(8));
    let propName = head.val.slice(1);                  // coupe du '&' de piste (sigil de piste, hors règle $)
    if (propName === 'clock') propName = 'synchro';    // alias LEGACY : le nom de surface est &synchro (PD 29/08)
    TsiNodeBuilder._checkKnownProp(propName, tk.str, head.pos);        // piste &prop connue ? (l.981)
    const CssClass = o_.css[propName] ?? Tsi_.makeGenericCss(propName);   // prop non modélisée → passe-plat (TsiTimeline l.2288)
    //  UNE SEULE PISTE `transform` PAR PIÈCE (PD 08/10) : deux animates sur la même propriété du même élément se gênent
    //  (le navigateur retire l'une d'elles) — pour combiner des rotations, une piste combinée (&rotXY, &rotXYZ…).
    if (CssClass.cssProp === 'transform') {
      const prev = piece.timeline?.tracks.find(t => t.css?.constructor?.cssProp === 'transform');
      if (prev) throw new Error(TsiTokenizer.posError(tk.str, head.pos,
        `&${propName} : la Pièce a déjà une piste transform (&${prev.prop}) — une seule par Pièce ; pour combiner des rotations : &rotXY, &rotXZ, &rotYZ, &rotXYZ`));
    }
    this.propName = propName;
    this.CssClass = CssClass;
    this.isClock  = (propName === 'synchro');

    this.track = new CssClass.track(propName, piece);   // le ctor de SA classe — le polymorphisme
                                                        // remplace l'ancien if (instanceof TsiTrackClock)
    if (piece.macros?.length) this.track.macros = piece.macros.slice();   // snapshot macro (pile → provenance)
    this.outTrack = null;

    // ctx-valeur de la piste, calculé UNE fois (_track l.986-987). isPureCss : prop
    // NON MODÉLISÉE (CSS générique) → valeur BRUTE jusqu'au ';'. Le flag vient de la
    // CLASSE (une générique s'auto-déclare isPureCss) : makeGenericCss ENREGISTRE
    // dans o_.css → le test « absent du registre » mentirait dès la 1re rencontre.
    this.ctx = { situation: TsiVar.VALUE, propName,
                 //  clôtures EXTERNES d'une valeur de KEY (jamais consommées par la valeur) :
                 //  `;` → la key · `<` → la transition · `&…` → la piste suivante.
                 endOut: t => t.val === ';' || t.val === '<' || t.val[0] === '&',
                 // Recupère 'isPureCss' de la propriété déclaré => tispiCore.js:773
                 isPureCss: CssClass.isPureCss === true
                            || (!TsiNodeBuilder.getConstraint?.(propName) && TsiNodeBuilder.isGenericProp?.(propName)) };

    // TÊTE DE PISTE, trois zones : les en-têtes `!<$$…>` · l'horloge, ou l'effet puis l'interpolation · les keys
    while (tk.at('!') && TsiNodeBuilder._atBangHeader(tk)) {   // !<$$xl…> — l'EN-TÊTE de la piste (exposition)
      tk.next();                                       // '!' — son '<' vient d'être vu par _atBangHeader
      TsiNodeBuilder._blockHeader(tk, piece, this.track.attrs);
    }
    let declaredLen = 0;                               // durée DÉCLARÉE du plateau (clock, l.1970-1977)
    if (!this.isClock) TsiTransitionBuilder.buildHead(tk, this.track, "de piste");
    else if (tk.at('!')) {                             // l'horloge : UN bloc de CONFIGURATION !<durée?, appel?>
      tk.next();                                       // '!'
      if (!tk.at('<')) throw new Error("TsiBuilder : '<' attendu après '!'\n" + tk.toDebug(8));
      // la liste : une durée (déclarée, max avec les pistes) et des appels/mots système, dans l'ordre d'écriture
      for (const call of TsiNodeBuilder._clockSystemCalls(tk)) {
        if (typeof call[0] === 'number') declaredLen = Math.max(declaredLen, call[0]);
        else (this.track._clockSystemCalls ||= []).push(call);
      }
    }

    // param : VESTIGE reproduit tel quel — buildTrack l.649 posait desc.param,
    // TOUJOURS undefined en pratique (_buildDescriptor l.578-580) ; le buildTrack
    // clock ne le touchait pas (reste null de l'init).
    if (!this.isClock) this.track.param = undefined;

    // ── KEYS ── la section d'entrée ; `!<durée:…>` après elle : la DISPARITION, puis la section de sortie (étape F-1)
    this.sink = this.track;                            // réceptacle courant — buildOut() peut le changer (Face)
    this.len = 0; this.lenOut = 0; this.hasIn = false; this.hasOut = false;
    this.lastFrame = -Infinity;                        // ordre croissant des frames — la Face repart à 0 pour sa sortie (buildOut)
    this.buildKeys();
    if (tk.at('!')) {                                  // `!<durée:…>` : le hideEffect — ce qui suit joue à la désactivation
      tk.next();                                       // '!'
      if (!tk.at('<')) throw new Error("TsiBuilder : '<' attendu après '!'\n" + tk.toDebug(8));
      TsiTransitionBuilder.expectDuration(tk, true, "effet de disparition");
      this.track.hideEffect = TsiHideEffect.build(tk);
      this.buildOut();                                 // CROCHET : la Face bascule le réceptacle vers sa piste de sortie
      this.buildKeys();                                // la section de SORTIE
    }

    if (this.isClock) {
      // Durée : déclarée ∨ keys (une key ÉTEND, n'écrase pas — l.1989/1993) ; LA
      // DURÉE VIT SUR L'HORLOGE (l.1996-1999) ; pseudo-key clock spécifique (l.2002).
      const trackLen = Math.max(declaredLen, this.len);
      this.track.animDuration = trackLen;
      TsiTrackClock.setPlateDurationTempo(trackLen, piece);
      this.track.keys.unshift(new TsiKeyClock(-1, null));
    } else {
      // Le tempo ne compte que la section IN (this.len ; les keys OUT comptent
      // dans this.lenOut, mesuré par la Face) — piste sans keys : len 0, max inchangé.
      TsiTrackClock.setPlateDurationTempo(this.len, piece);              // (buildTrack l.667)
      // Pseudo-key -1 : valeur par défaut, garantit keyCurr non-null (l.671-676).
      // entrance : legacy plus émise → pseudo-key sans transition.
      if (CssClass.defaultValue !== undefined)
        this.track.keys.unshift(new CssClass.key(-1, new TsiValConst(CssClass.defaultValue)));
    }

    this.track.initCss(CssClass);                      // EN DERNIER : le css a besoin des keys

    if (this.isClock) this.track._applyClockSystemCalls();   // ctor TsiTrackClock l.1953 (après build + css)

    TsiNodeBuilder.postBuild[propName]?.(this.track, piece);     // ctors ACTIFS copiés (button/drag/videoSynchro)
    this.finishOneTrack();                             // CROCHET (Face : miroir transition/param/pseudo/css sur la jumelle)
    return this.track;
  }

  // ── KEYS — copie-transformée de _buildKeys l.1017-1232 fusionnée avec la
  //    pose des champs (buildTrack l.653-665) : chaque key est CONSTRUITE au fil
  //    du walk, reçue par this.sink (pushKey). Compteurs sur l'instance. ──
  buildKeys() {
    const tk = this.tk, piece = this.piece;
    const propName = this.propName;
    //  (réceptacle, compteurs et ordre des frames : initialisés par buildOneTrack — buildKeys lit une SECTION, étape F-1)
    let contentOpen = null, contentClosed = false, anyKey = false;   // balise de CONTENU (l.1024)
    //  ce qui CLÔT la série des keys : la fin · la `&piste` suivante ou le `&` final · le `!` de la disparition
    const endsKeys = tok => tok === TsiTokenizer.END || TsiTokenizer.isAmp(tok) || tok.val === '!';

                                                      //_________________________________________
    while (true) {                                    // boucle de lecture des keys (l.1026-1109)
      const p = tk.peek(true);
      if (endsKeys(p)) break;                          // le `!` n'est pas consommé : il revient à la piste

      if (p.val === '...') {                                        // `...$macro` — l'INCRUSTATION d'une macro de keys (39g ; étape 5)
        tk.next();                                                   // '...'
        const v = tk.peek(true);
        if (v === TsiTokenizer.END || v.type !== 'var')
          throw new Error(TsiTokenizer.posError(tk.str, p.pos, `... : une variable de macro est attendue, ...$nom`));
        TsiNodeBuilder.insertMacro(v, tk, piece, true);              // STRICT : nul = rien ; autre forme = erreur nommée
        continue;
      }
      if (p.type === 'var') {                                       // (l.1033-1041)
        const nx = tk.peekNext(true).val;
        if (nx === '<' || nx === '>') {                             // <marqueur splicé → pile>
          const m = TsiNodeBuilder.macroMark(tk, piece);
          // RÈGLE (PD) : un fermant de TRACK-macro (`>1`) clôt la PISTE en cours —
          // ce qui le suit appartient à la piste SUIVANTE de l'hôte.
          if (m.sign === '>' && m.target === 1) break;
          continue;                                                 // `<0`/`<1`/`>0` : frontière de key (top de boucle)
        }
        // `$nom` nu en position de KEY est une VALEUR, jamais une macro (39g) : la key-macro s'écrit `...$nom`.
        // (Le repli macro→valeur d'avant l'étape 5 est retiré.)
      }

      // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)
      // Balise (mark) : CONTENU ou ZONE, discrimination par POSITION (l.1050-1064).
      if (p.type === 'mark') {
        if (contentOpen && !contentClosed) {                        // seule la fermante assortie est légale
          if (!p.closing || p.val !== contentOpen)
            throw new Error(TsiTokenizer.posError(tk.str, p.pos,
              `balise <*|${contentOpen}*> (contenu de &${propName}) : fermante <*/${contentOpen}*> attendue`));
          tk.next(); contentClosed = true; continue;
        }
        const n = tk.peekNext(true);
        if (!p.closing && !(n === TsiTokenizer.END || TsiTokenizer.isAmp(n))) {   // ouvrante de CONTENU
          if (anyKey || contentClosed)                              // couverture TOTALE exigée
            throw new Error(TsiTokenizer.posError(tk.str, p.pos,
              `balise <*|${p.val}*> : le contenu doit englober TOUTES les keys de &${propName}`));
          tk.next(); contentOpen = p.val; continue;
        }
        break;                                                      // balise de ZONE → remonte à buildTracks
      }
      if (contentClosed)                                            // key APRÈS la fermante (l.1066-1068)
        throw new Error(TsiTokenizer.posError(tk.str, p.pos,
          `balise <*|${contentOpen}*> : le contenu doit englober TOUTES les keys de &${propName}`));
      if (p.val === ';')   { tk.next(); continue; }                 // ';' isolé (l.1069)

      // Tout autre jeton appartient à une KEY : elle NAÎT ici, lit ses composants, se ferme au ';' (étape E-1, PD 28/09).
      // BALAYAGE FANTÔME avant de la construire, rien n'est consommé (PD 30/09) :
      // est-ce la DERNIÈRE key, une frame nue — `frame : ;` suivie de ce qui clôt la piste ?
      const isLast = (p.type === 'number' || p.type === 'var')
                  && tk.peekOffset(1).val === ':' && tk.peekOffset(2).val === ';'
                  && endsKeys(tk.peekOffset(3) || TsiTokenizer.END);
      const key = this.buildOneKey(isLast);
      this.pushKey(key, key.numFrame);                 // CROCHET-général (Face : key 0 "" d'héritage + comptage out)
      anyKey = true;
    }

    if (contentOpen && !contentClosed)                 // (l.1229-1231)
      throw new Error(`TsiBuilder : balise <*|${contentOpen}*> (contenu de &${propName}) non fermée dans la piste\n` + tk.toDebug(8));
    if (contentOpen) this.markContent(contentOpen);    // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark) — balise de CONTENU
  }

  // ── UNE KEY (étape E-1, PD 28/09) — elle naît à son premier jeton, c'est-à-dire à tout jeton que la piste ne reconnaît
  //    pas ; elle lit ses composants dans l'ordre de la source : en-têtes, effet d'apparition, frame, valeur, interpolation ;
  //    elle se ferme au ';' (ou devant un jeton de piste si le ';' manque).
  //    `isLast` : buildKeys a reconnu la DERNIÈRE key, une frame nue — la borne de durée (étape E-2). ──
  buildOneKey(isLast) {
    const tk = this.tk, piece = this.piece;
    const propName = this.propName;
    const key = new this.CssClass.key();                                   // NAISSANCE : frame et valeur viendront
    if (piece.macros?.length) key.macros = piece.macros.slice();           // PROVENANCE macro, dès la naissance

    // 1 — EN-TÊTE(S) de key `<$$xl…>` (PD 2026-08-20, exposition) : mes attributs, écrits directement.
    while (tk.at('<') && TsiNodeBuilder._atBlockHeader(tk))
      TsiNodeBuilder._blockHeader(tk, piece, key.attrs);

    // 2 — EFFET D'APPARITION `<durée:…>`, avant la frame
    if (tk.at('<')) {
      TsiTransitionBuilder.expectDuration(tk, true, "effet d'apparition de key");
      key.effect = TsiEffect.build(tk);
    }

    // 3 — FRAME optionnelle (l.1094-1109).
    const kp = tk.peek(true);
    let frame, hasFrame = false;
    const pn = tk.peekNext(true);
    //  UNE DÉCLARATION n'a pas sa place dans une piste (PD 08/10) : sans ce contrôle, `let $x = …` devenait la valeur
    //  texte d'une key sobre, et la variable n'existait jamais.
    if (kp !== TsiTokenizer.END && kp.type === 'ident' && TsiVar.DECLAR.has(kp.val) && pn !== TsiTokenizer.END && pn.type === 'var')
      throw new Error(TsiTokenizer.posError(tk.str, kp.pos,
        `${kp.val} ${pn.val} : une déclaration se place en tête, avant la première &piste`));
    //  `{-$z-12}:1` — la frame est un SCRIPT de construction (PD 06/10) : bâti comme un script de valeur, ÉVALUÉ UNE FOIS ici,
    //  il doit rendre un nombre. La frame reste posée à la construction et non modifiée — les règles communes suivent.
    const isScript = kp !== TsiTokenizer.END && kp.type === 'block' && kp.val === '{' && tk.tokens[kp.posPair + 1]?.val === ':';
    if (isScript || (kp !== TsiTokenizer.END && (kp.type === 'number' || kp.type === 'var') && pn !== TsiTokenizer.END && pn.val === ':')) {
      if (isScript) {
        const js = new TsiJs(piece, {});
        js.buildScript(tk, tk.current + 1, kp.posPair);
        frame = js.get(piece);
        if (typeof frame !== 'number' || !Number.isFinite(frame))
          throw new Error(TsiTokenizer.posError(tk.str, kp.pos,
            `{…}: — une frame de key doit être un nombre connu à la construction (reçu ${typeof frame})`));
        tk.current = kp.posPair + 1;                 // posé sur ':' — consommé avec les autres formes
      } else if (kp.type === 'var') {             // `$debut:1;` — la frame est une VARIABLE de construction (notice §5, M10 08/09) :
        const v = TsiVar.resolveVar(piece, kp.val)?.entry?.get();   //  résolue au build (un paramètre constModule, une const)
        if (typeof v !== 'number')
          throw new Error(TsiTokenizer.posError(tk.str, kp.pos,
            `${kp.val}: — une frame de key doit être un nombre connu à la construction (reçu ${v === undefined ? 'variable inconnue' : typeof v})`));
        frame = v; tk.next();
      } else frame = tk.next().val;                  // number
      tk.next();                                     // ':'
      hasFrame = true;
      if (frame < 0)
        throw new Error(TsiTokenizer.posError(tk.str, kp.pos, TsiLang.t('frameNegative', { prop: propName, frame })));
      if (frame <= this.lastFrame)
        throw new Error(TsiTokenizer.posError(tk.str, kp.pos,
          TsiLang.t('frameOrder', { prop: propName, frame, prev: this.lastFrame })));
      this.lastFrame = frame;
      key.setFrame(frame);
    }

    // 4 — Balise de VALEUR : ouvrante juste après `frame:` (l.1121-1126).
    let valueMark = null;                          // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)
    const vm = tk.peek(true);
    if (hasFrame && vm !== TsiTokenizer.END && vm.type === 'mark' && !vm.closing) {
      tk.next();
      valueMark = vm.val;
    }

    // VALEUR (l.1129-1143) — buildClass, piloté par ctx (registre).
    const valTok = tk.peek(true);
    //  `$nom` nu en position de key est une VALEUR (39g). S'il est SEUL et que sa déclaration porte une MACRO, l'auteur
    //  voulait l'incrustation : erreur nommée au build, plutôt qu'un objet macro servi au runtime (étape 5, 08/09).
    //  Au TOKEN, avant construction : le sigil enverrait la valeur à TsiJs (expression), pas à un lecteur.
    if (valTok !== TsiTokenizer.END && valTok.type === 'var' && TsiVal.isEnd(tk.peekNext(true), this.ctx)
        && TsiVar.resolveVar(piece, valTok.val)?.entry?.getValue() instanceof TsiValMacro)
      throw new Error(TsiTokenizer.posError(tk.str, valTok.pos,
        `${valTok.val} est une macro : une key ne la porte pas comme valeur — l'incrustation s'écrit ...${valTok.val}`));
    //  LA FENÊTRE DE LA VALEUR (PD 30/09) : la valueKey est d'abord BORNÉE — de `frame:` jusqu'à `<` · `;` · `&…` · fin,
    //  cherchée au niveau 0 (les blocs () [] {} sont sautés) — puis construite dans sa borne : le jeton de fin se lit END
    //  pour tous les lecteurs de la valeur. La valeur doit lire TOUTE sa borne ; la borne est rendue avant de continuer.
    let fin = tk.searchLevel(t => TsiVal.isEnd(t, this.ctx), tk.current);
    if (fin < 0) fin = tk.length;
    const len = tk.length;
    tk.length = fin;
    let value;
    try {
      value = (!TsiVal.isEnd(valTok, this.ctx)) ? TsiVal.buildClass(tk, piece, this.ctx) : TsiNodeBuilder._EMPTY;
      if (tk.current !== fin) {                      // la valeur n'a pas lu toute sa borne : signalé, puis le reste est sauté (PD 01/10)
        TsiError.warning(TsiTokenizer.posError(tk.str, tk.tokens[tk.current]?.pos ?? tk.str.length,
          `&${propName} : valeur de key — « ${tk.tokens[tk.current]?.val} » inattendu avant la fin de la valeur, ignoré`));
        tk.current = fin;
      }
    }
    finally { tk.length = len; }                     // la borne rendue, toujours — même quand la valeur a levé
    if (propName === 'synchro' && value instanceof TsiVar)          // &synchro = temporel pur (l.1141)
      throw new Error(TsiTokenizer.posError(tk.str, valTok.pos,
        "&synchro : pas de variable dans la piste d'horloge (temporel pur)"));

    if (valueMark) {                                 // fermante assortie exigée (l.1149-1154)
      const cl = tk.next(true);
      if (cl === TsiTokenizer.END || cl.type !== 'mark' || !cl.closing || cl.val !== valueMark)
        throw new Error(TsiTokenizer.posError(tk.str, vm.pos,
          `balise <*|${valueMark}*> (valeur) : fermante attendue juste après la valeur`));
    }

    // 5 — INTERPOLATION `<…>`, après la valeur : vers la key suivante — `<>` → NONE
    if (tk.at('<')) {
      TsiTransitionBuilder.expectDuration(tk, false, "interpolation de key");
      key.interpolation = TsiInterpolation.build(tk);
    }

    // 6 — Clôture : le ';'. Valeur absente : le marqueur interne (chaîne vide) ; sur la DERNIÈRE key `frame:;`,
    //     la borne de durée (undefined) — décidé par buildKeys, avant la construction.
    if (tk.at(';')) tk.next();
    key.setValue((value === TsiNodeBuilder._EMPTY) ? (isLast ? undefined : "") : value);
    if (!hasFrame) key.setFrame(0);
    if (valueMark) key.mark = valueMark;             // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)
    return key;
  }

  // Réception d'une key construite (général) — la Face SPÉCIALISE (héritage out, comptage).
  pushKey(key, frame) {
    this.sink.keys.push(key);
    this.len   = frame + 1;                            // desc.len : frame+1 à chaque key
    this.hasIn = true;
  }

  // Balise de CONTENU posée sur la piste (général) — la Face ÉTEND (jumelle OUT).
  markContent(name) { this.track.markContent = name; }   // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)   // (ex-arr.markContent → TsiTimeline l.2296)

  // ═══════════════════════════════════════════════════════════════════════════
  //  HELPERS statiques (copies de Tsi Compiler — tispiParser condamné : seul le
  //  TOKENIZER y survivra ; références rebasées Tsi Compiler.* → TsiBuilder.*)
  // ═══════════════════════════════════════════════════════════════════════════

  static _EMPTY = Symbol('empty');                     // (tispiParser l.691)

  // Hooks de registre (copiés de tispi001 l.4429-4434 — le build vit AVEC le noyau).
  static getConstraint = (prop) => o_.css[prop];
  static isGenericProp = (prop) => prop in document.documentElement.style;
  static knownProps    = () => Object.keys(o_.css);    // pour « piste inconnue »

  /** Le curseur est-il sur une balise de paramètre (token 'mark') ? (l.1277-1280) */
  // ═══ ⚠ BALISES DE PARAMÈTRE `<*|nom*> … <*/nom*>` — ANNULÉES (PD 2026-08-15) ═══
  //  LE MÉCANISME EST MORT : ne rien y ajouter, ne pas s'en servir, ne pas
  //  l'invoquer dans une conception nouvelle. Le debuild ne les ré-émet PAS —
  //  une branche qui en porte les PERD à la sauvegarde.
  //  Ce qu'elles faisaient : marquer, dans le data-tsi d'un module, quelle piste
  //  (ZONE), quelles keys (CONTENU) ou quelle valeur (SCALAIRE) appartenaient à
  //  un paramètre nommé — la part de l'appelant du réducteur.
  //  Ce qui reste en place, INERTE, en attendant l'excision : le token `mark` du
  //  tokenizer (tispiParser.js), les champs `mark` / `markContent` (TsiKey,
  //  TsiTrack), leur lecture ici (buildTracks, buildKeys), les crochets de la
  //  Face (jumelles) et le filtre de tispiFuncs.js.
  static _atMark(tk) {
    const t = tk.peek(true);
    return t !== TsiTokenizer.END && t.type === 'mark';
  }

  /** Balise de paramètre de ZONE (l.1287-1300) : vérifie l'appariement et retourne
   *  le nouvel état de balise ouverte (string | null). v1 : pas d'imbrication. */
  static _mark(tk, openMark) {
    const t = tk.next();
    if (t.closing) {
      if (openMark !== t.val)
        throw new Error(TsiTokenizer.posError(tk.str, t.pos, openMark
          ? `balise fermante <*/${t.val}*> : c'est <*|${openMark}*> qui est ouverte`
          : `balise fermante <*/${t.val}*> sans ouvrante`));
      return null;
    }
    if (openMark)
      throw new Error(TsiTokenizer.posError(tk.str, t.pos,
        `balise <*|${t.val}*> : <*|${openMark}*> déjà ouverte (imbrication non supportée)`));
    return t.val;
  }

  /** Piste &prop connue ? typée (registre) OU prop CSS générique valide. (l.1539-1546) */
  static _checkKnownProp(prop, src, pos) {
    if (TsiNodeBuilder.getConstraint(prop) != null) return;   // piste connue (typée)
    if (TsiNodeBuilder.isGenericProp(prop)) return;           // prop CSS générique valide (passe-plat)
    const known = TsiNodeBuilder.knownProps();
    throw new Error(TsiTokenizer.posError(src, pos,
      TsiLang.t('propUnknown', { prop, known: known.slice().sort().join(', ') })));
  }

  /** Bloc de CONFIGURATION de l'horloge !< [durée:] [, appel | mot]… > — une LISTE, dans l'ordre d'écriture (N11-2, PD 08/10) :
   *  `!<600:, clockMaster(world), repeat>`. Payload : un tableau par élément — [durée] | [nom, ...args] | [mot]. */
  static _clockSystemCalls(tk) {
    tk.next();                                                       // '<'
    const items = [];
    while (!tk.at('>')) {
      const t = tk.next(true);
      if (t === TsiTokenizer.END) throw new Error("TsiBuilder : '>' attendu dans !<…>\n" + tk.toDebug(8));
      if (t.val === ',') continue;
      const frames = TsiTransitionBuilder._timeToFrames(t);         // une DURÉE (frames, `2s`, `500ms` — le lecteur des transitions, N20) : se termine par ':'
      if (frames !== null) {
        if (!tk.at(':')) throw new Error("TsiBuilder : ':' attendu après la durée dans !<…> (un temps se termine par ':', ex. !<300:>)\n" + tk.toDebug(8));
        tk.next(); items.push([frames]); continue;
      }
      if (t.type !== 'ident') throw new Error("TsiBuilder : nom de fonction clock, mot ou durée attendu dans !<...>\n" + tk.toDebug(8));
      const args = [];
      if (tk.at('(')) {                                              // nom(a,b,…)
        tk.next();
        while (!tk.at(')')) {
          const a = tk.next(true);
          if (a === TsiTokenizer.END) throw new Error("TsiBuilder : ')' attendu dans " + t.val + "(...)\n" + tk.toDebug(8));
          if (a.val !== ',') args.push(a.val);
        }
        tk.next();
      }
      items.push([t.val, ...args]);                                  // forme nue : 0 argument (ex. !<face>, !<repeat>)
    }
    tk.next();                                                       // '>'
    return items;
  }

  // ═══ BLOC D'EN-TÊTE `<$$attr…>` — chantier EXPOSITION (PD 2026-08-20) ═══════
  //  TOTALEMENT INDÉPENDANT des transitions : mêmes délimiteurs, AUTRE citoyen.
  //  Le SITE discrimine par le sigil du 1er token intérieur (_atBlockHeader) AVANT
  //  d'appeler quiconque — _transition n'est pas touchée. Les deux blocs
  //  s'enchaînent : `!<$$xl> !<ease> keys…` / `<$$xl> <goto> 20:v <play>;`.

  /** tk posé SUR le '<' : le bloc qui s'ouvre est-il une EN-TÊTE (1er token à sigil) ? */
  static _atBlockHeader(tk) {
    const t = tk.peekOffset(1);
    return !!t && t !== TsiTokenizer.END && (t.type === 'attr' || t.type === 'var');
  }

  /** Entrée : sur '!'. Le bloc qui s'ouvre est-il une EN-TÊTE, `!<$$attr…>` ? Rien n'est consommé. */
  static _atBangHeader(tk) {
    const t = tk.peekOffset(2);
    return tk.peekOffset(1).val === '<' && (t.type === 'attr' || t.type === 'var');
  }

  /** Lit `< entrée (';' entrée)* '>'` — entrée = `$$nom [~<…>] [= valeur]`, la forme
   *  DÉVELOPPÉE de la zone d'attributs (TsiAttrsBuilder.buildEntree, réutilisé tel
   *  quel). Dépose dans `attrs` — la table du PORTEUR (piste, key, demain autre).
   *  Les variables de bloc (`$nom := …`) viendront avec le bloc de variable (étape 5). */
  static _blockHeader(tk, node, attrs) {
    tk.next();                                             // '<'
    const contexte = { contenant: attrs, piece: node, situation: TsiVar.HEADER,
                       endOut: t => t.val === ';' || t.val === '>' };   // clôtures d'une valeur d'entrée
    while (true) {
      const t = tk.peek(true);
      if (t === TsiTokenizer.END)
        throw new Error("bloc d'en-tête : '>' attendu\n" + tk.toDebug(8));
      if (t.val === '>') { tk.next(); break; }
      if (t.val === ';') { tk.next(); continue; }
      if (t.type === 'attr') { TsiAttrsBuilder.buildEntree(tk, null, contexte); continue; }
      throw new Error(TsiTokenizer.posError(tk.str, t.pos,
        "bloc d'en-tête : $$attr attendu ($var : à venir — étape 5)"));
    }
  }


  /** Pose d'une piste construite dans une timeline, avec DÉDUP — copie de
   *  TsiTimeline (tispi001 l.2279-2287 : TsiError.choice). Nuance assumée : la 2e
   *  piste est déjà CONSTRUITE quand on la jette (l'ancien détectait avant
   *  construction) — cas d'erreur d'auteur. */
  static insertTrack(timeline, track, owner) {
    const prev = timeline.getTrack(track.prop);
    if (prev) {
      const rep = TsiError.choice(
        `Piste '&${track.prop}' déclarée deux fois sur '${owner?.div?.id ?? owner?.prop ?? '?'}'`,
        ['garder la première', 'garder la seconde', 'abandonner']);
      if (rep === 0) return;                           // 1re gardée
      if (rep === 2) TsiError.error(`TsiTimeline : piste '&${track.prop}' en double — installation abandonnée`);
      timeline.tracks.splice(timeline.tracks.indexOf(prev), 1);    // 2e gardée
    }
    timeline.tracks.push(track);
  }

  //  (`allocTrack` SUPPRIMÉE le 2026-08-13. Elle instanciait par
  //   `Object.create(CssClass.track.prototype)` — ctor NON exécuté — puis recopiait
  //   la liste des champs à la main, plus un `if (t instanceof TsiTrackClock)` pour
  //   deux champs d'horloge sur sept. Contournement né quand le ctor de TsiTrack
  //   prenait la TABLE PLATE et faisait le build ; le ctor a été réduit à
  //   l'identité, le contournement est resté → DEUX déclarations de la même forme,
  //   divergentes. Une piste se crée désormais par `new CssClass.track(prop, piece)` :
  //   le polymorphisme du `new` choisit le bon ctor, chaque classe déclare SA forme.)

  /** Marqueur de macro splicé (`$nom` '<'|'>' target) → pile piece.macros :
   *  Open pousse, Close dépile (TsiMacroOpen/Close, tispiParser). Le snapshot
   *  `.slice()` est pris par buildOneTrack/buildKeys à la création de l'élément.
   *  @returns {{sign, target}} — pour ROUTER : un fermant est un SÉPARATEUR
   *  structurel (règle PD) : `>1` clôt la key en cours, `>0` clôt la PISTE. */
  static macroMark(tk, piece) {
    const nom    = tk.next(true).val;                  // '$nom' (sigil conservé)
    const sign   = tk.next(true).val;                  // '<' | '>'
    const target = tk.next(true).val;                  // RÈGLE PD : 0 = KEYS · 1 = PISTES
    const m = (sign === '<') ? new TsiMacroOpen(nom, piece, target) : new TsiMacroClose(nom, piece);
    m.build();
    return { sign, target };
  }

  /** Incrustation d'une macro (l.1243-1269) + GARDE DE CYCLE (nouvelle) : splice le
   *  corps de la TsiValMacro à la place du $nom, encadré des marqueurs $nom<…$nom>. */
  //  strict (`...$nom`, ou `$nom` nu en position de piste — étape 5, 39g) : le rôle macro est AFFIRMÉ par le site.
  //  Une valeur NULLE n'incruste rien (le paramètre `constModule $x = null;` d'un module : le corps se bâtit sans,
  //  l'instance fournit) ; une autre forme qu'une macro est une erreur nommée ; une variable inconnue aussi.
  //  Non strict : rend false sur une forme non-macro et laisse le site retomber.
  static insertMacro(p, tk, piece, strict = false) {
    const val = tk.peekNext(true).val;
    if(val === ':=' || val === '=') return false;  // déclaration/affectation, pas un usage-macro
    const nom = p.val;  // Important on garde le $ pour le nom
    const varDecl = TsiVar.resolveVar(piece, nom); // Surtout pas slice(1) car on veut garder le $ pour la provenance
    if(varDecl==null)                              // fin du retrait SILENCIEUX (TODO d'avant l'étape 5) : une erreur nommée
      throw new Error(TsiTokenizer.posError(tk.str, p.pos, `${nom} : variable inconnue — une macro déclarée est attendue ici`));
    const macroScript = varDecl.entry.getValue(); // On récupère le script de la macro
    const nul = macroScript == null || macroScript === TSI_NULL
             || (macroScript instanceof TsiValConst && macroScript.get() == null);
    if (nul) { tk._splice(tk.current, 1, ""); return true; }   // rien d'incrusté : le défaut nul (39g)
    if(!(macroScript instanceof TsiValMacro)) {
      if (strict) throw new Error(TsiTokenizer.posError(tk.str, p.pos,
        `${nom} : macro attendue (un source entre backticks) — reçu ${macroScript.constructor?.name ?? typeof macroScript}`));
      return false;
    }
    let src = macroScript.src.trim();
    let target = 0;                                            // RÈGLE PD : 0 = KEYS · 1 = PISTES
    if (src.startsWith(':')) src = src.replace(/^\s*:/, '');   // key-macro (target 0) : l'entête ':' est STRIPPÉE
    else if (!src.startsWith('&')) return false; // ne débute ni par ':' ni par '&' → pas une macro
         else target = 1;   // track-macro : on GARDE le '&' de tête
    // ⚠ TODO GARDE DE CYCLE — NEUTRALISÉE depuis que la pile empile des PAIRES
    //   [nom, target] (2026-08-13) : `includes(nom)` compare une chaîne à des
    //   tableaux et rend TOUJOURS faux. $a := `… $a …` → re-splice infini, seul
    //   MAX_SPLICES arrête. Refonte retenue (PD, à mûrir) : « empiler et vérifier
    //   la présence » — la présence se lit SUR LA MACRO elle-même :
    //     • ouvrant → macroScript.isOpen = true ; fermant → false ;
    //     • garde ICI : `if (macroScript.isOpen) throw` — O(1), par IDENTITÉ,
    //       couvre les cycles multi-couches ($a→$b→$c→$a) quel que soit le point
    //       d'entrée : ce qui trahit la boucle est la réentrée dans une macro
    //       ENCORE OUVERTE, pas son point de départ ;
    //     • le message raconte la CHAÎNE en lisant piece.macros depuis le nom
    //       réentrant (le drapeau détecte, la pile raconte) ;
    //     • remise à zéro en tête de build() — le chemin d'erreur RE-LANCE le build
    //       sur la même Pièce : un drapeau resté levé (ou une pile non vide,
    //       défaut déjà présent aujourd'hui) fabriquerait un FAUX cycle.
    if (piece.macros?.includes(nom))
      throw new Error(TsiTokenizer.posError(tk.str, p.pos, `macro ${nom} : cycle d'incrustation`));
    // Encadrement : `$nom< target  corps  ; $nom> target`.
    //  - ESPACE après target (sinon il COLLE au corps : `< 1200,500` → token 1200) ;
    //  - ';' AVANT le fermant : blinde la frontière — un corps sans ';' final
    //    laisserait le fermant en position de VALEUR ; le ';' clôt toute key
    //    pendante par le chemin standard (';' isolé = ignoré, toujours inoffensif).
    //    C'est la mécanique de la RÈGLE (PD) : un fermant clôt l'unité en cours.
    src = nom + '< ' + target + ' ' + src + ' ; ' + nom + '> ' + target;
    tk.splice(tk.current, 1, src);
    return true;
  }

  // ── postBuild — corps ACTIFS des ctors de piste, copiés (exécutés après css,
  //    comme dans le ctor : code post-super). Coquilles vides : rien à faire. ──
  static postBuild = {

    //  &button (REFONDU PD 2026-08-22) — un RELAIS : la table d'états se lit des
    //  keys, la machine et le câblage vivent dans le RÔLE (TsiCssButton,
    //  tispiTracksCss.js). L'ancien corps posait ici quatre gotoStopGroup en dur
    //  (frames 1/0/2/1) — c'est désormais la machine à balises qui décide.
    button(track, piece) {
      track.css.buildStates(track, piece);
      if (piece.attrs?.$$button)
        TsiError.warning(`#${piece.div.id} : $$button ET &button — double écriture ; `
                       + `la piste câble (elle porte la table), l'attribut s'abstiendra`);
      track.css.initMouse(piece);
    },

    // (drag SUPPRIMÉ le 2026-08-16 avec la piste &drag — cf. tispiTracksCss.js.
    //  `$$drag` pose les mêmes listeners ET déclare la cible du plateau d'états.)
    // (videoSynchro / sliderSynchro RETIRÉS le 2026-10-11, étape S-1 : le média se construit en phase A,
    //  prepareFace — à la connexion les enfants de la Face n'existent pas encore.)
  };
}
//    ##########     ####     ###########      #########      ###########
//    ####    ####   ####     ####            ####    ####    ####       
//    ####    ####   ####     ####            ####            ####       
//    ##########     ####     ########        ####            ########   
//    ####           ####     ####            ####            ####       
//    ####           ####     ####            ####    ####    ####       
//    ####           ####     ###########      #########      ###########
//
//
//
//
// ═════════════════════════════════════════════════════════════════════════════
//  TsiPieceBuilder — PIÈCE : timeline UNIQUE + membrane de plateau.
// ═════════════════════════════════════════════════════════════════════════════
class TsiPieceBuilder extends TsiNodeBuilder {

  // Pas de data-tsi → timeline VIDE, jamais null (build l.913).
  emptyBuild() { this.piece.timeline = new TsiTimeline(this.piece); }

  // Timeline d'ACCUEIL vide — remplie au fil (placeTrack).
  openTimelines() { this.piece.timeline = new TsiTimeline(this.piece); }

  // Pose avec DÉDUP (TsiBuilder.insertTrack — copie TsiTimeline l.2279-2287).
  placeTrack(track) { TsiNodeBuilder.insertTrack(this.piece.timeline, track, this.piece); }

  // MEMBRANE du plateau (build l.921) : élection/fusion clock → lien tempo.ptClock.
  finish() { TsiTrackClock.addPieceToPlate(this.piece); }
}

// tsi-pf / tsi-pg : des PIÈCES (TsiPieceFace, face en COMPOSITION) — le build
// pièce s'applique tel quel ; coquilles prêtes pour leur spécifique futur.
class TsiPieceFaceBuilder  extends TsiPieceBuilder {}
class TsiPieceGroupBuilder extends TsiPieceBuilder {}

// ── RE-BUILD d'un élément DÉJÀ construit (ex-safeCompile, mort avec tispiParser).
//    Site : l'expansion de module (tispiModules._expandHost étape 6) — data-module
//    retiré, data-tsi = les pistes PROPRES de l'hôte. Réutilise l'objet Tispi
//    existant (idUnic, registre, module posé à l'étape 5) : seul le TAG choisit
//    la classe, comme au connectedCallback ; l'isolation par élément est déjà
//    dans le ctor. (TsiGroupBuilder : tispiGroup.js, résolu à l'APPEL.)
TsiNodeBuilder.forElement = function (el) {
  const obj = el._tsi ?? el._tsiFace;                  // l'objet Tispi EXISTANT (jamais recréé)
  //  Le switch lit le TAG CANONIQUE (`node.tag`, posé par chaque ctor — PD 21/08),
  //  plus le localName : en notation div, `div-g` couvre TROIS classes — la
  //  déduction a tiré UNE fois à la naissance, le nœud se souvient. Une page
  //  tsi-x et une page div-x dispatchent ici à l'identique.
  switch (obj?.tag) {                                  // switch : seule la branche PRISE résout sa classe
    case 'tsi-p':  return new TsiPieceBuilder(obj);
    case 'tsi-f':  return new TsiFaceBuilder(obj);
    case 'tsi-pf': return new TsiPieceFaceBuilder(obj);
    case 'tsi-pg': return new TsiPieceGroupBuilder(obj);
    case 'tsi-g':  return new TsiGroupBuilder(obj);
  }
};


// ═════════════════════════════════════════════════════════════════════════════
//  TsiFaceBuilder — FACE : une Pièce SANS &clock. Le token 'out' SPLITTE chaque
//  piste en deux jumelles (in → timeline, out → timelineOut) ; durées SCALAIRES
//  locales (animDuration via le tempo ; durOut mesuré ici — les pistes OUT ne
//  passent pas par le tempo, la gymnastique durIn de l.3052-3058 devient
//  inutile). Pas de membrane (faces non adressables). L'effet IN/OUT n'est PAS
//  un travail de build : lancé au RUNTIME par les règles goto (setActivePlate →
//  _armGoto(0)/playTrack autonome ; onHide → playOut).
//  Copie-transformée de TsiFaceDom.buildParse (tispi001 l.3007-3071).
// ═════════════════════════════════════════════════════════════════════════════
class TsiFaceBuilder extends TsiNodeBuilder {

  // Réceptacles du split — initialisés ICI (le ctor parent lance build() AVANT que
  // les class fields de l'enfant soient posés : piège JS classique).
  openTimelines() {
    this.tracksIn  = [];
    this.tracksOut = [];
    this.durOut    = 0;
  }

  // FACE : PAS de déclaration (PD 2026-08-05) — toute déclaration vit dans un
  // nœud PIÈCE parent (resolveVar remonte le DOM, les faces sont traversées).
  //  (L'interdiction de déclarer dans une Face est LEVÉE — PD 2026-08-19 : « les
  //   faces se construisent le plus possible comme les pièces ». Le crochet hérité,
  //   vide, reprend : la déclaration s'inscrit dans face.vars comme chez une Pièce,
  //   et resolveVar la voit — une Face pure se pose en div._tsi à sa naissance.)

  //  Piste de SORTIE (même prop) — une VRAIE piste : ses keys, sa transition, sa
  //  pseudo-key, son css, donc son propre animate. L'apparition et la disparition
  //  sont deux animations autonomes qui se RECOUVRENT (playOut : la face sortante
  //  passe en z-index -1 pendant que la nouvelle entre) : il en faut bien deux.
  //  ⚠ CRÉÉE PARESSEUSEMENT (2026-08-20) — au token `out`, quand on SAIT 
  //  que placeTrack jetait faute de keys : morte-née, mais déjà inscrite au
  //  registre par le ctor de TsiTrack (mesuré : 1 orpheline sur 4 pistes).
  _allocOut() {
    const out = new this.CssClass.track(this.propName, this.piece);
    if (this.piece.macros?.length) out.macros = this.piece.macros.slice();
    return out;
  }

  // `!<durée:…>` après les keys (ex-token 'out', étape F-1) : bascule du réceptacle vers la piste de sortie ;
  // les frames de sortie repartent à 0.
  buildOut() { this.sink = this.outTrack ??= this._allocOut(); this.lastFrame = -Infinity; }

  // Réception d'une key : comptage par SECTION (len/hasIn vs lenOut/hasOut). Le départ de la valeur COURANTE
  // n'est plus une key 0 "" d'héritage : c'est le hideEffect qui le joue (étape F-2, TsiTrack.hideKeys).
  pushKey(key, frame) {
    if (this.sink === this.outTrack) {
      this.sink.keys.push(key);
      this.lenOut = frame + 1;
      this.hasOut = true;
      return;
    }
    super.pushKey(key, frame);
  }

  // Les balises suivent les DEUX sections (_splitPairs l.3141-3142) — quand la
  // section out existe : la piste de sortie est désormais créée paresseusement.
  markTrack(openMark)  { super.markTrack(openMark);  if (this.outTrack) this.outTrack.mark = openMark; }        // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)
  markContent(name)    { super.markContent(name);    if (this.outTrack) this.outTrack.markContent = name; }     // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)

  // Miroir sur la piste OUT (l'ancien TsiTimeline(pairsOut) → ctor complet) :
  // transition de PISTE commune (_splitPairs l.3115-3123), param vestige,
  // pseudo-key -1, css propre — et LE LIEN, posé ici où les deux sont en main.
  finishOneTrack() {
    //  `out` écrit sans aucune key : la piste existe mais ne sera jamais placée.
    //  Elle sort du registre plutôt que d'y rester en orpheline.
    if (!this.hasOut) {
      if (this.outTrack) { this.outTrack.idUnic?.remove(); this.outTrack = null; }
      return;
    }
    const out = this.outTrack, CssClass = this.CssClass;
    out.interpolation = this.track.interpolation;
    out.hideEffect    = this.track.hideEffect;         // la sortie porte ce qui la déclenche : le jeu (F-2) le lit ICI
    if (!this.isClock) out.param = undefined;
    if (CssClass.defaultValue !== undefined)
      out.keys.unshift(new CssClass.key(-1, new TsiValConst(CssClass.defaultValue)));
    out.initCss(CssClass);
    //  LE LIEN EST PORTÉ, PAS RECALCULÉ (PD 2026-08-20) : trois sites retrouvaient
    //  la sortie par une RECHERCHE — deux par `prop`, un par `css.constructor.jsProp`
    //  (_matchInTrack), qui pouvait apparier deux propriétés DIFFÉRENTES écrivant le
    //  même jsProp. Une piste connaît désormais sa sortie directement.
    this.track.out = out;
  }

  // Collecte par section — les pistes sans keys dans une section n'y existent pas
  // (_splitPairs l.3143-3150 : push si hasIn / si hasOut).
  placeTrack(track) {
    if (this.hasIn)  this.tracksIn.push(track);
    if (this.hasOut) { this.tracksOut.push(this.outTrack);
                       this.durOut = Math.max(this.durOut, this.lenOut + (this.track.hideEffect?.duration ?? 0)); }   // la sortie : hideEffect + section (F-2)
  }

  // Montage final (buildParse l.3032-3071) : plateau d'apparition + plateau de
  // disparition + héritage des keys vides + loop.
  finish() {
    const face = this.piece, el = this.div;

    // ── Plateau d'APPARITION (l.3032-3047) ──
    if (this.tracksIn.length) {
      face.timeline = new TsiTimeline(face);
      for (const t of this.tracksIn) TsiNodeBuilder.insertTrack(face.timeline, t, face);   // dédup (ex-TsiTimeline(pairsIn))
      // Priorité Pièce > Face — uniquement les vraies collisions de cible (l.3037-3041) :
      // la Pièce maître écrit sur la face courante via ses props FTarget.
      const master = el.parentNode._tsi;
      if (master && master.timeline)
        face.timeline.tracks = face.timeline.tracks.filter(tr =>
          !(tr.css instanceof TsiCssFTarget && master.timeline.getTrack(tr.prop)));
      // Durée de l'effet d'apparition — graftée sur le tempo par setPlateDurationTempo.
      // L'effet IN/OUT est un animate AUTONOME (sans horloge) : pas de plateau-clock.
      face.animDuration = TsiTrackClock.getDivClockTempo(el).animDuration ?? 0;
    }

    // ── Plateau de DISPARITION — one-shot, piloté par onHide()/playOut() (l.3050-3060).
    //    Invisible des fonctions de groupe (pas dans div._tsi.timeline). ──
    if (this.tracksOut.length) {
      face.timelineOut = new TsiTimeline(face);
      face.timelineOut.tracks.push(...this.tracksOut);
      face.durOut    = this.durOut;                    // durée de la sortie (mesurée ici, tempo intact)
      face._outTimer = null;
    }

    // ── Keys à valeur vide ("" ou null) → héritage (l.3064-3070) ──
    for (const tl of [face.timeline, face.timelineOut]) {
      if (!tl) continue;
      for (const tr of tl.tracks)
        for (const key of tr.keys)
          if (key.numFrame >= 0 && (key.value === "" || key.value == null))
            key._inheritPrev = true;
    }

    face.loop = false;                                 // chemin DSL : pas de flag de bouclage (l.3016)
  }
}

//    #########    ###########   #########    ####    ####   ####   ####       #########
//    ####    ##   ####          ####    ##   ####    ####   ####   ####       ####    ##
//    ####    ##   ####          ####    ##   ####    ####   ####   ####       ####    ##
//    ####    ##   ########      #########    ####    ####   ####   ####       ####    ##
//    ####    ##   ####          ####    ##   ####    ####   ####   ####       ####    ##
//    #########    ###########   #########     ########      ####   ########   #########

// ═════════════════════════════════════════════════════════════════════════════
//  process
//  1241 1257 line line 1014 exportBranch => 1000 dataTsi
//  TsiDebuild — LES ENTRÉES du debuild, symétrique de TsiBuild (qui tient les
//  statiques de la CONSTRUCTION : prepareRoot, preparePiece…).
//
//  LE CONTEXTE `{ out, dt }` — deux productions indépendantes, deux buffers :
//     out    l'HTML : balise, id, style, cargaison. Son propre script.
//     dt     l'INTÉRIEUR du data-tsi : attrs, vars, transition, pistes, keys,
//            valeurs. TOUT ce qui atterrit dans data-tsi écrit `ctx.dt += …`,
//            sans exception et sans chaîne intermédiaire.
//  Il est construit PAR NŒUD (exportBranch) et ne transporte rien de cumulatif :
//  la mémoire de la sauvegarde — la table de noms d'attributs — vit sur
//  `o_.projet.attrs` (TsiAttrsOutService), remise à neuf par la RACINE
//  (exportBranch_), jamais dans le ctx. Décision PD : « c'est le rôle du ctx »
//  vaut pour les CLÔTURES (ctx.endIn/endOut, côté lecture), pas pour une table
//  globale — un ctx par nœud remettrait ses index à zéro.
//
//  ⚠ NE JAMAIS RELIRE un buffer en cours de route : V8 accumule des cons-strings
//  sans rien recopier, et la moindre lecture force l'aplatissement — mesuré
//  6670× le coût du += seul. Un drapeau local, jamais `if (ctx.dt)`.
// ═════════════════════════════════════════════════════════════════════════════
class TsiDecompiler {
  //  DÉTOURNEMENT — l'émission vit dans la CLASSE : TsiPiece.debuildDataTsi
  //  (tispiPiece.js) écrit attrs → vars → !transit → pistes → '&', dans l'ordre
  //  exact que buildHead relit. Cette coquille n'existe plus que pour rendre une
  //  CHAÎNE à exportBranch, qui écrit encore l'attribut lui-même.
  //  
  static dataTsi(node) {
    const ctx = { out: '', dt: '' };
  
    node.debuildDataTsi(ctx);
    return ctx.dt;
  }


  /**
   * Une branche (élément tsi-*) → HTML source, récursif. Attributs émis :
   * id, data-tsi (régénéré des tables), style (SOURCE capturé, _tsiSrcStyle).
   * Enfants tsi-* récursés ; feuille → innerHTML tel quel (contenu source,
   * le runtime n'écrit que sur les éléments tsi-*, pas dedans).
   */
  //  LA RACINE d'une sauvegarde : elle seule remet la table de noms d'attributs à
  //  neuf. La récursive n'y touche jamais — une table par NŒUD ferait désigner à la
  //  place 0 un nom différent d'un nœud à l'autre, alors qu'UNE seule table part
  //  dans le fichier compagnon : la page ne se relirait pas.
  //  (Unité = LA BRANCHE — PD : le fichier complet est un cas particulier de la
  //   sauvegarde d'une branche.)
  //
  //  ⚠ TODO — exportPage (l.1255) et saveDocument (l.1271) bouclent sur PLUSIEURS
  //    racines comme si c'étaient des branches indépendantes :
  //        roots.map(r => exportBranch(r, …))
  //    Chacune passant par exportBranch_ remettrait la table à zéro, et seule la
  //    dernière serait publiée. Dans le modèle « la page EST une branche », la
  //    remise à neuf appartient à exportPage / saveDocument — une fois, AVANT leur
  //    boucle — et la boucle appelle la RÉCURSIVE exportBranch. À reprendre.
  static exportBranch_(el, indent = '', onlyChildEl = null, reduceHosts = false) {
    if (el == null) return '';
    TsiAttrsOutService.reset();                    // racine d'une sauvegarde de BRANCHE
    return TsiDecompiler.exportBranch(el, indent, onlyChildEl, reduceHosts);
  }
  /**
   * UNE BRANCHE → son source HTML, RÉCURSIVE. Le nœud se restitue depuis son
   * MODÈLE (node.debuildDataTsi → data-tsi régénéré), jamais depuis le texte
   * d'origine ; ses enfants Tispi se restituent par le même chemin, une feuille
   * rend son innerHTML tel quel.
   *
   * ⚠ Ce n'est PAS la racine d'une sauvegarde : la table de noms d'attributs
   *   n'est pas remise à neuf ici — c'est le rôle d'exportBranch_ (ci-dessus).
   *
   * @param {Element} el   l'ÉLÉMENT DOM de tête. Son composant est lu par
   *                       `el._tsi ?? el._tsiFace` — un élément non-Tispi
   *                       (un <script>, une div de cargaison) rend `''`.
   * @param {string} [indent='']   l'indentation FABRIQUÉE de ce niveau,
   *                       préfixée à la balise ouvrante ; la récursion descend
   *                       avec `indent + '  '`.
   * @param {Element} [onlyChildEl=null]   1er NIVEAU seulement : n'exporter que
   *                       CET enfant — export « pièce + face COURANTE » de
   *                       l'éditeur ; en dessous, la récursion est complète.
   * @param {boolean} [reduceHosts=false]   mode RÉDUCTEUR (compression d'un hôte
   *                       de module à sa forme compressée). ⚠ NEUTRALISÉ : ne
   *                       produit plus qu'un warning, la sortie est APLATIE —
   *                       point d'accroche de la nouvelle compression.
   * @returns {string} la branche en HTML source — `''` si `el` n'est pas Tispi.
   */
  static exportBranch(el, indent = '', onlyChildEl = null, reduceHosts = false) {
    const node = el._tsi ?? el._tsiFace;                  // l'objet Tispi EXISTANT (jamais recréé)
    if (!node) return '';
    // ⚠ MODULE — BRANCHEMENT 4/4 vers tispiModules.js, NEUTRALISÉ le 2026-08-09
    //   en vue de sa suppression. Mode RÉDUCTEUR : une instance de module se
    //   ré-émettait ICI en FORME COMPRESSÉE à sa place (jamais d'aplatissement).
    //   Débranché, l'export CONTINUE et APLATIT — ce que l'ancien contrat
    //   interdisait : la sortie est développée, pas compressée.
    //   À REPRENDRE : c'est le point d'accroche de la NOUVELLE compression.
    if (reduceHosts && node?.module)
      TsiError.warning(`MODULE SUPPRIMÉ — export : l'instance « ${node.module} » `
        + `(#${el.id ?? '?'}) sera APLATIE au lieu d'être ré-émise compressée `
        + `(tispiParser.js, branchement 4/4).`);
    // (data-module N'EST PAS émis : le développé n'est pas un hôte — PD. La
    //  provenance vit dans piece.module ; dataTsi l'émet en `$$module = nom;`.)
    
    //---------------------------------------------------------------------
    // Construction du data-tsi : attrs, vars, !transit, pistes, keys, valeurs. Le ctx est
    // passé à chaque élément, qui y écrit son contenu. Le ctx est unique pour la
    // branche : les tables d'attributs sont partagées, et l'ordre d'émission doit
    // être respecté pour que la relecture fonctionne.
    //---------------------------------------------------------------------
    const ctx = { out: '', dt: '' };              
    node.debuildDataTsi(ctx);                             // construction du data-tsi (attrs, vars, transit, pistes, keys, valeurs)
    //----Retour-dans-ctx--------------------------------------------------
                                                          // Ecriture du script du header de div. 
    const attrs = [];                                     // ex : <tsi-p id="toto" data-tsi="..." style="...">
    
    // ctx.dt = le contenu du data-tsi redéveloppé (attrs, vars, transit, pistes, keys, valeurs)
    if (ctx.dt) attrs.push(` data-tsi="${ctx.dt}"`);

    // (style SOURCE capturé par le runtime, pas le style courant : l'export
    //  ne doit pas refléter les changements de style faits par le runtime, mais
    //  l'état initial de la page. Le style courant est dans le data-tsi.)
    if (el._tsiSrcStyle) attrs.push(` style="${el._tsiSrcStyle}"`);

    const divHeader = `${indent}<${el.localName} id="${el.id}"${attrs.length ? attrs.join('') : ''}>`;

    //  LES ENFANTS, dans l'ordre du DOM — VERBATIM ENTRELACÉ. Le DOM EST le
    //  modèle : un enfant Tispi se restitue par SON debuild, tout le reste est
    //  de la CARGAISON recopiée telle quelle, à sa place.
    //  AUCUNE mise en forme fabriquée : les nœuds-texte d'origine PORTENT la
    //  mise en page de la source (le retour ligne et les espaces devant un
    //  <tsi-f…> sont dans le nœud-texte qui le précède) — d'où la récursion
    //  SANS indent, et `indent` réservé au préfixe de la RACINE.
    //  Pas de cas « feuille » : la même boucle couvre tout, un nœud sans enfant
    //  Tispi rend simplement sa cargaison. (Le repli innerHTML a disparu, et
    //  avec lui la PERTE du texte d'un nœud MIXTE — Pièce fille + texte.)
    //  RÈGLE DES ITÉRATEURS : la conversion branche→source parcourt childNodes —
    //  elle VOIT les commentaires (bornes de paramètre '|nom'/'/nom' ET
    //  commentaires d'AUTEUR, qui étaient perdus) ; tout autre traitement reste
    //  sur children (aveugle).
    //  La Pièce __clock__ (implicite au start ou écrite) S'EXPORTE comme toute
    //  pièce : rechargée, elle compile en horloge DÉCLARÉE et est élue → pas de
    //  seconde création implicite. Durée/maître/stops voyagent naturellement —
    //  arbitrage PD 2026-07-11.
    const parts = [];
    for (const n of el.childNodes) {
      const child = n._tsi ?? n._tsiFace;
      if (child) {                                          // Tispi → récursion (le MODÈLE se restitue)
        // onlyChildEl (1er NIVEAU seulement) : export « pièce + face COURANTE »
        // — les autres faces sont omises. En dessous, la récursion est complète.
        if (onlyChildEl && n !== onlyChildEl) continue;
        parts.push(TsiDecompiler.exportBranch(n, '', null, reduceHosts));
      }
      else if (n.nodeType === 1) parts.push(n.outerHTML);          // élément nu = cargaison PURE
      else if (n.nodeType === 3) parts.push(n.data);               // texte, verbatim — LA mise en page
      else if (n.nodeType === 8) parts.push(`<!--${n.data}-->`);   // commentaire : borne OU auteur
    }
    return `${divHeader}${parts.join('')}</${el.localName}>`;
  }

  /** Récolte les NOMS de fonctions appelés par le sous-arbre — ZÉRO inférence :
   *  on lit le MODÈLE RÉIFIÉ. Ne sont collectées que les fonctions NOMMÉES
   *  (TsiValFunc) : ce qui référence une classe est une méthode, elle voyage avec
   *  le moteur et n'a rien à embarquer. Le tri système/projet/module se fait en
   *  aval, dans _funcsBody.
   *  2026-08-11 — RÉPARÉ : cherchait `instanceof TsiFc` dans un `Array.isArray(k.value)`,
   *  deux conditions devenues IMPOSSIBLES depuis la réification (TsiFc n'est plus
   *  construite, une valeur de key est un TsiVal). Le collecteur ne récoltait donc
   *  plus rien, et une page exportée partait SANS les fonctions de son auteur. */
  static collectFuncNames(el, names = new Set()) {
    //  COUPE 26/08 : le modèle réifié est désormais LA TABLE `_t` du bloc — elle
    //  porte les TsiValFuncDeclar appelés (et les TsiVar, ignorées ici). L'ancienne
    //  lecture (TsiValFunc/args/actions/TsiValPath) visait des classes SUPPRIMÉES —
    //  et `v.actions` était déjà mort (champ disparu à la réification).
    const grab = v => {
      if (!v) return;
      if (v instanceof TsiJs)            { for (const c of v._t ?? []) grab(c); }
      else if (v instanceof TsiValFuncDeclar) { if (!v._name.startsWith('$')) names.add(v._name); }
      else if (v instanceof TsiValArray) v.array.forEach(grab);     // tuple / [ … ]
    };
    for (const t of (el._tsi?.timeline?.tracks ?? []))
      for (const k of t.keys) grab(k.value);
    for (const c of el.children)
      if (c._tsi || c._tsiFace) TsiDecompiler.collectFuncNames(c, names);
    return names;
  }

  /** 
   * Vérifier si cette fonction est utile. Rend le corps des fonctions à embarquer
   * 
   * Fonctions à EMBARQUER, par STATUT : système → rien (partout) ; projet →
   *  func_<doc> (REPLI MASSIF : une seule utilisée → tout funcProject — jamais
   *  faux, mais jamais fin non plus) ; module → son compartiment d'ORIGINE en
   *  bloc. Nom introuvable → warning.
   *
   *  ⚠ Le tri fin n'a AUCUN mécanisme prévu (relevé 2026-08-12). Il devait venir
   *  d'un scan des marqueurs `.fc.nom(` — l'appel court `element.fc.nom(…)`, qui
   *  a été SUPPRIMÉ de tispiFuncs.js le 2026-08-12 : il n'était appelé nulle part,
   *  ne montrait rien (Proxy sans piège de listage) et avalait les fautes de frappe.
   *  Un appel de fonction depuis JavaScript s'écrit désormais `o_.funcs.exe(nom,
   *  cible, params)`, dont le nom est une CHAÎNE — donc illisible à un scan textuel.
   *  Le repli massif reste donc la seule règle.
   *  @returns {string} bloc `<script data-tsi-funcs>` ou '' */
  /** Les registrations de fonctions du sous-arbre en JS PUR (lignes), ou ''.
   *  Partagé : exportFunctions l'enrobe dans un <script> (single-file autonome),
   *  saveDocument l'écrit dans le fichier projet externe (débogable). */
  /*static _funcsBody(el, docName) {
    const names = TsiDecompiler.collectFuncNames(el);
    let usesProject = false;
    const moduleRegs = new Set();
    for (const n of names) {
      if (o_.funcProject?.[n]) { usesProject = true; continue; }
      if (o_.functions?.[n])   continue;                       // système : rien à émettre
      let found = false;
      for (const k in o_)
        if (k.startsWith('func_') && o_[k]?.[n]) { moduleRegs.add(k); found = true; break; }
      if (!found) TsiError.warning(`export : fonction "${n}" introuvable dans les registres.`);
    }
    const parts = [];
    const emit = (regName, reg) => {
      // Depuis que toutes les entrées partagent la classe TsiValFuncDeclar, on
      // ré-émet la REGISTRATION — nom, compilé, signature — et non plus la classe
      // (l'ancien constructor.toString() recopiait la classe MOTEUR, et
      // Object.entries ramassait `_name`, la clé d'identité de la table).
      // Exige des fonctions AUTO-CONTENUES : une capture de closure ne voyage pas.
      // Les ~function sont ÉCARTÉES : leur source voyage en copié-collé dans le
      // data-tsi de leur bloc (TsiJs.src) et se redéclare au parse — les
      // ré-émettre ici ferait un DOUBLON refusé par add() au chargement. Marqueur :
      // seul le builder de ~function pose `moduleVar` sur une déclaration.
      const fs = (reg.items ? reg.items() : Object.values(reg))  // Tab typée | legacy {}
        .filter(f => !('moduleVar' in f));
      if (!fs.length) return;
      parts.push(`o_.${regName} = o_.${regName} ?? {};`);
      for (const f of fs)
        parts.push(`o_.${regName}[${JSON.stringify(f._name)}] = new TsiValFuncDeclar(`
                 + `${JSON.stringify(f._name)}, ${f._fn.toString()}, ${JSON.stringify(f._signature)});`);
    };
    if (usesProject && o_.funcProject) emit(`func_${docName}`, o_.funcProject);
    for (const reg of moduleRegs) emit(reg, o_[reg]);
    return parts.join('\n');
  }

  /** 
   * Bloc <script> inline des fonctions (single-file autonome), ou ''. */
  /* Vérifier si cette fonction est utile */
  /*static exportFunctions(el, docName) {
    const body = tispiBuild._funcsBody(el, docName);
    return body ? `  <script data-tsi-funcs="1">\n${body}\n  </script>\n\n` : '';
  }
  */

  /**
   * Une branche → PAGE HTML COMPLÈTE, jouable de façon autonome (même patron
   * que maFace.html) : entête (scripts moteur) + Pièce d'APERÇU enveloppante
   * (&face 0:id) + pied (o_.start). À l'import, graftGroup n'extrait que la
   * racine tsi-f/tsi-g sous le tsi-p — l'enveloppe d'aperçu est ignorée.
   * @param {Element} el     racine de branche (tsi-f/tsi-g ; un tsi-p est émis tel quel)
   * @param {string} [title] titre de la page (défaut : id de la branche)
   * @param {Element} [onlyChildEl] si défini, exporte « pièce + face COURANTE » — les autres faces de la pièce sont omises. Récursion en-dessous : complète.
   * @returns {string} le HTML complet, jouable de façon autonome
   */
  // ═══ ⚠ EN TRAVAUX (PD 2026-08-15) — NE PAS S'Y FIER ═══════════════════════
  //  Même réserve qu'exportPage : le chantier de la sauvegarde est saveDocument.
  //  De plus, exportFile repose sur _pageShell, qui produit une page TOUT INLINE
  //  (deux <script> dans le corps : la table d'attributs et les registres de
  //  fonctions) — modèle PÉRIMÉ : le code engendré appartient au fichier .js
  //  d'accompagnement. Et elle n'ouvre pas la mémoire des noms d'attributs.
  // ═════════════════════════════════════════════════════════════════════════════
  static exportFile(el, title = el.id || 'branche Tispi', onlyChildEl = null) {
    // Pièce exportée telle quelle ; une branche tsi-f/tsi-g reçoit une Pièce
    // d'APERÇU enveloppante (ignorée à l'import : graftGroup n'extrait que la
    // racine sous le tsi-p).
    const branch = el._tsi?.isPiece                  // l'OBJET, pas le tag (PD 21/08) — vaut pour les DEUX notations
      ? TsiDecompiler.exportBranch(el, '  ', onlyChildEl, false)
      : `  <!-- Pièce d'APERÇU : permet de VOIR la branche en ouvrant ce fichier seul. -->
  <tsi-p id="preview" data-tsi="&face 0:${el.id};&"
         style="left:200px; top:120px; width:320px; height:240px">

  ${TsiDecompiler.exportBranch(el, '    ', null, false)}

  </tsi-p>`;

    // Fonctions embarquées : nom du doc = l'espace du canon (groupe racine du
    // document COURANT), sinon le titre de page, sinon 'doc'.
    const docName = ([...document.body.children].find(e => e.localName === 'tsi-g')?.id
                     || document.title || 'doc').replace(/\W+/g, '_');
    const funcs = TsiDecompiler.exportFunctions(el, docName);
     // TODO à revoir
    return TsiDecompiler._pageShell(title, funcs, branch, TsiDecompiler._attrsCodeBlock());
  }

  /** Publie la table d'attributs engendrée : `o_.projet.attrsCode = {…}`, posé
   *  AVANT le corps (decodeAttrs le lit au connectedCallback). '' si aucun attribut. */
  //  CONSTRUCTION FINALE (fin de debuild de la branche complète) : la liste des
  //  noms se DÉCOUPE en tableaux de 31 (toTables) et se publie AVANT le corps —
  //  decodeAttrs / tables() la liront au build. Entêtes true__ INTACTES : elles
  //  tombent au build (TsiAttrsBuilder.strip), jamais pendant la sauvegarde.
  //  TODO : placer ce bloc dans le fichier externe tsi_<projet>.js (debugger).
  //  Rend du JAVASCRIPT NU — pas de balise. Le `<script>` inline n'existe plus
  //  (PD 2026-08-15 : le code engendré vit dans le fichier .js d'accompagnement
  //  de la page ; c'est la raison d'être de data-tsi). Destination : le
  //  `tsi_<projet>.js` de saveDocument, à côté des registres de fonctions.
  static _attrsCodeBlock() {
    const tabs = o_.projet?.attrs?.toTables() ?? [[], []];
    return `o_.projet = Object.assign(o_.projet || {}, { attrsCode: ${JSON.stringify(tabs)} });\n`;
  }

  /** Le squelette de page — entête (scripts moteur), corps, `o_.start`. Partagé
   *  par exportFile (UNE branche + aperçu) et exportPage (TOUTE la page). Pas de
   *  règle CSS tsi-* : le positionnement est un concern du MOTEUR (position:
   *  absolute posé au constructeur). @param proj table d'attributs publiée (ou '').
   *
   *  ⚠ EN TRAVAUX (PD 2026-08-15) : ce squelette produit une page TOUT INLINE —
   *  `${proj}` et `${funcs}` sont posés dans le <body> comme code engendré. Le
   *  `<script>` inline n'existe plus : le code engendré vit dans le fichier .js
   *  d'accompagnement (cf. saveDocument). `_attrsCodeBlock` rend désormais du JS
   *  NU — inséré tel quel ici, il écrirait du JavaScript au milieu du HTML.
   *  À refondre avec exportFile / exportPage. */
  static _pageShell(title, funcs, body, proj = '') {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { background:#1a1a1a; margin:0; width:100vw; height:100vh; }
  </style>
  <script src="tispiTools.js"></script>
  <script src="tispiParser.js"></script>
  <script src="TsiParserTabPlate.js"></script>
  <script src="tispiUndo.js"></script>
  <script src="tispiTrack.js"></script>
  <script src="tispiCore.js"></script>
  <script src="tispiPiece.js"></script>
  <script src="tispiTracksCss.js"></script>
  <script src="tispiVar.js"></script>
  <script src="tispiBuild.js"></script>
  <script src="tispiGroup.js"></script>
  <script src="tispiLayout.js"></script>
  <script src="tispiFuncs.js"></script>
  <script src="tispiLang.fr.js"></script>
  <script src="tispiEditor.js"></script>
  <script>o_.singleAnim = true;</script>
</head>
<body>
${proj}${funcs}${body}

  <script>o_.start(null, 100/6);</script>
</body>
</html>
`;
  }

  /** TOUTE la page → HTML complet, jouable. Chaque branche racine (tsi-* DIRECTE
   *  sous `container`) est exportée TELLE QUELLE — pas d'enveloppe d'aperçu, les
   *  pièces sont déjà à leur place. Fonctions embarquées collectées sur l'ensemble.
   *  La vérité = le DOM au runtime (`_tsi`/`_tsiFace`), pas l'indentation source. */
  // ═══ ⚠ EN TRAVAUX (PD 2026-08-15) — NE PAS S'Y FIER ═══════════════════════
  //  Le chantier de la sauvegarde se concentre sur `saveDocument` (le couple
  //  <projet>.html + tsi_<projet>.js, head RÉEL capturé, code engendré dans le
  //  fichier compagnon débogable). exportPage — page autonome, tout inline, head
  //  FABRIQUÉ par _pageShell — reste en arrière : elle n'ouvre pas la mémoire des
  //  noms d'attributs (elle appelle la RÉCURSIVE exportBranch sans remise à neuf),
  //  donc sa table publiée peut ne pas correspondre aux positions qu'elle a émises.
  //  À reprendre APRÈS saveDocument, quand le cycle sauvegarde → fichiers →
  //  rechargement aura été bouclé en entier.
  // ═════════════════════════════════════════════════════════════════════════════
  static exportPage(container = document.body, title = document.title || 'page Tispi') {
    const roots = [...container.children].filter(c => c._tsi || c._tsiFace);
    const body  = roots.map(r => TsiDecompiler.exportBranch(r, '  ', null, false)).join('\n\n');
    const docName = ([...document.body.children].find(e => e.localName === 'tsi-g')?.id
                     || document.title || 'doc').replace(/\W+/g, '_');
    const funcs = TsiDecompiler.exportFunctions(container, docName);   // collectFuncNames parcourt les enfants
    return TsiDecompiler._pageShell(title, funcs, body, TsiDecompiler._attrsCodeBlock());
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  LA VUE COMPRESSÉE — chantier EXPOSITION (PD 2026-08-19/20)
  // ═══════════════════════════════════════════════════════════════════════════
  //  Une VUE de session, JAMAIS exécutable : le développé reste en vie, rien ne
  //  disparaît. Format = le data-tsi FILTRÉ (la grammaire existante, amputée du
  //  non-marqué) :
  //    · nœud $$xl                    → émis ENTIER (tout manipulable) ;
  //    · nœud non marqué qui ABRITE   → coquille (cadre verrouillé) : balise + id,
  //      du marqué                      contenu filtré ;
  //    · nœud sans rien               → omis ;
  //    · piste $$xl                   → émise entière ; non marquée à keys $$xl →
  //      amorce `&prop` + SEULES les keys marquées ;
  //    · variable $$xl                → sa déclaration.
  //  ANCRES — rien n'est stocké, tout est calculé ICI (PD : un champ mémorisé
  //  divergerait) : l'élément porte `data-idu` (idUnic de session du nœud), la
  //  piste `/*@uid*/` (son idUnic — les keys s'ancrent par LUI + numFrame, une
  //  key neuve par une SŒUR ; le tokenizer SAUTE les commentaires, la vue reste
  //  re-parsable). Le chemin LISIBLE, c'est le texte lui-même : id + prop + frame.
  static compressBranch(el) {
    return TsiDecompiler._compNode(el, '', true);      // la RACINE s'émet toujours : le cadre
  }
  static _compNode(el, indent, force = false) {
    const node = el._tsi ?? el._tsiFace;
    if (!node) return '';                              // cargaison non-Tispi : hors vue
    const xl    = !!node.attrs?.['$$xl'];
    const kids  = [...(el.children ?? [])].map(c => TsiDecompiler._compNode(c, indent + '  '))
                                          .filter(s => s);
    const corps = TsiDecompiler._compDataTsi(node, xl);
    if (!force && !xl && !corps && !kids.length) return '';   // rien à montrer sous ce nœud
    let s = `${indent}<${el.localName} id="${el.id}" data-idu="${node.idUnic.uid}"`
          + (corps ? ` data-tsi="${corps}"` : '') + '>';
    if (kids.length) s += '\n' + kids.join('\n') + '\n' + indent;
    return s + `</${el.localName}>`;
  }
  //  Le CONTENU filtré d'un nœud — `all` (nœud $$xl) passe tout, sinon le tri.
  static _compDataTsi(node, all) {
    const ctx = { out: '', dt: '' };
    for (const v of node.vars?.values() ?? [])                       // variables marquées
      if (all || v.attrs?.['$$xl']) v.debuild(ctx);
    for (const t of node.timeline?.tracks ?? []) {
      if (t._synth) continue;                                        // synthétique : re-générée au build
      const tXl = all || !!t.attrs?.['$$xl'];
      const ks  = t.keys.filter(k => k.numFrame >= 0 && (tXl || k.attrs?.['$$xl']));
      if (!tXl && !ks.length) continue;
      ctx.dt += '&' + t.prop + ' /*@' + t.idUnic.uid + '*/';         // l'ANCRE de la piste
      if (tXl) t.debuildConfig(ctx);
      for (const k of ks) { ctx.dt += ' '; k.debuild(ctx); }
      ctx.dt += ' ';
    }
    return ctx.dt.trim();
  }

  // ═══ LE CHEMIN RETOUR — appliquer la vue au DÉVELOPPÉ (PD 2026-08-20) ═══════
  //  Le traitement pose `$$mod` sur les composants qu'il a MODIFIÉS ou CRÉÉS :
  //  le retour n'applique QU'EUX — aucune comparaison, aucun diff. Adressage
  //  NOMINATIF (PD) : le nœud par son id, la piste par sa prop, la variable par
  //  son nom, la key par son numFrame. Les gestes passent par les ATOMES
  //  (deleteKey / insertKeyRaw → undo + _regoto) — jamais d'affectation nue.
  //  v1 : les VALEURS — variable modifiée, key modifiée, key CRÉÉE. Hors champ,
  //  pour la suite : création de piste, de variable, de nœud ; suppression.
  //  `viewRoot` = l'arbre de la vue (éléments DÉTACHÉS, jamais connectés — la vue
  //  n'est pas exécutable) ; `liveRoot` = la racine VIVANTE correspondante.
  static applyView(viewRoot, liveRoot) {
    //  UN GESTE = UN CRAN (PD) : les inverses s'empilent librement, la BALISE fait le
    //  cran — même motif que le drag au mousedown. Tout ce que la vue applique se
    //  défait d'un seul Ctrl+Z, quel que soit le nombre d'atomes empilés.
    if (typeof TsiUndo !== 'undefined') TsiUndo.newTransaction('applyView');
    const vivants = {};                                          // id → nœud vivant
    (function walk(el) {
      const n = el._tsi ?? el._tsiFace;
      if (n && el.id) vivants[el.id] = n;
      for (const c of el.children ?? []) walk(c);
    })(liveRoot);
    const faits = [];                                            // journal des gestes appliqués
    (function walk(el) {
      const node = vivants[el.id], dt = el.dataset?.tsi;
      if (node && dt) TsiDecompiler._applyDataTsi(node, dt, faits);
      else if (!node && el.id) faits.push('⚠ nœud inconnu du vivant : #' + el.id);
      for (const c of el.children ?? []) walk(c);
    })(viewRoot);
    return faits;
  }

  //  Balaye le data-tsi d'UN élément de vue : variables puis pistes, et n'agit
  //  que sur les porteurs de `$$mod`. Les valeurs se construisent par la fabrique
  //  RÉELLE (TsiVal.buildClass) — mêmes clôtures qu'une valeur de key.
  static _applyDataTsi(node, dt, faits) {
    const tk = new TsiTokenizer(dt);
    const ctxVal = { situation: TsiVar.VALUE,
                     endOut: t => t.val === ';' || t.val === '<' || t.val[0] === '&' };
    //  lit les blocs d'en-tête devant un composant → la liste des $$attrs portés.
    //  ⚠ bang=true : les blocs de PISTE (`!<…>`) SEULEMENT — un `<…>` nu après
    //  &prop appartient à la PREMIÈRE KEY (mesuré : il se faisait manger).
    const blocs = (bang) => {
      const noms = [];
      while (true) {
        const t = tk.peek(true);
        if (t === TsiTokenizer.END) break;
        if (bang) {
          if (t.val !== '!' || tk.peekOffset(1)?.val !== '<') break;
          tk.next();                                             // '!'
        } else if (t.val !== '<') break;
        if (!TsiNodeBuilder._atBlockHeader(tk)) { if (bang) tk.current--; break; }   // `!<ease>`/`<ease>` : pas à nous
        tk.next();                                               // '<'
        while (tk.peek(true) !== TsiTokenizer.END && tk.peek(true).val !== '>') {
          const e = tk.next();
          if (e.type === 'attr') noms.push(e.val);               // les valeurs/`;` sont ignorés ici
        }
        tk.next();                                               // '>'
      }
      return noms;
    };
    while (tk.peek(true) !== TsiTokenizer.END) {
      const t = tk.peek(true);
      if (t.val === ';') { tk.next(); continue; }
      if (t.type === 'var') {                                    // ── VARIABLE : $nom <…> := valeur ;
        const nom = tk.next().val;
        const mod = blocs().includes('$$mod');
        if (tk.peek(true)?.val === ':=') tk.next();
        const v = TsiVal.buildClass(tk, node, ctxVal);
        if (mod) {
          const decl = node.vars?.get(nom + '$$');
          if (!decl) { faits.push(`⚠ ${nom} : déclaration absente sur #${node.div.id}`); continue; }
          decl.setValue(v?.get ? v.get(node) : v);               // l'atome des variables
          faits.push(`${nom} ← modifiée sur #${node.div.id}`);
        }
        continue;
      }
      if (TsiTokenizer.isAmp(t)) {                            // ── PISTE : &prop <…> keys…
        const prop = tk.next().val.slice(1);
        const track = node.timeline?.getTrack(prop);
        blocs(true);                                             // blocs de PISTE (!<…>) : lus, ignorés en v1
        while (tk.peek(true) !== TsiTokenizer.END && !TsiTokenizer.isAmp(tk.peek(true))
               && tk.peek(true).type !== 'var') {
          if (tk.peek(true).val === ';') { tk.next(); continue; }
          const kMod = blocs(false).includes('$$mod');          // ── UNE KEY : <…> frame: valeur <…> ;
          let frame = 0;
          const f = tk.peek(true);
          if (f !== TsiTokenizer.END && f.type === 'number' && tk.peekNext(true)?.val === ':') {
            frame = tk.next().val; tk.next();                    // frame ':'
          }
          const val = TsiVal.buildClass(tk, node, ctxVal);
          blocs();                                               // transition de départ éventuelle : ignorée en v1
          if (!kMod) continue;
          if (!track) { faits.push(`⚠ &${prop} : piste absente sur #${node.div.id}`); continue; }
          const K = track.css.constructor.key;                   // la classe de key de LA famille
          const exist = track.keys.some(k => k.numFrame === frame);
          if (exist) track.deleteKey(frame);                     // ⚠ 2 crans d'undo (setKeyValue : atome à venir)
          track.insertKeyRaw(frame, new K(frame, val));
          faits.push(`&${prop} ${frame} ← ${exist ? 'modifiée' : 'CRÉÉE'} sur #${node.div.id}`);
        }
        continue;
      }
      tk.next();                                                 // token hors champ v1 : passé
    }
  }

  /** SAUVEGARDE PROJET → { nomFichier: contenu } — DEUX fichiers (PD) :
   *   • `<projet>.html`  : head réel + `<script src="tsi_<projet>.js">` + branches ;
   *   • `tsi_<projet>.js`: le code ENGENDRÉ (attrsCode + fonctions), en fichier
   *     EXTERNE et DÉBOGABLE — le debugger HTML ne respecte pas les lignes des
   *     <script> inline, donc rien de généré n'y reste.
   *  La DISTRIBUTION (écriture des fichiers) est saveToServer (save.php). */
  static saveDocument(el) {
    //  LA SAUVEGARDE EST LA BRANCHE (PD) — le fichier complet n'en est qu'un cas
    //  particulier : on passe le GROUPE RACINE du document, et il contient tout.
    //  Une branche, une table de noms, un couple de fichiers : le contrat est
    //  d'un seul tenant.
    const node = el?._tsi ?? el?._tsiFace;
    if (!node) TsiError.error(`sauvegarde : <${el?.localName ?? '?'}> n'est pas un composant Tispi`);

    //  LE NOM VIENT DE LA RACINE (PD) : c'est son id. Il nomme les deux fichiers
    //  (`<nom>.html`, `tsi_<nom>.js` — save.php n'accepte que `^[\w.-]+$`), le
    //  lien du head et la zone tispi_name. C'est un NOM DE VARIABLE, comme tout
    //  id Tispi (TsiStart.ID_FORMAT) : AUCUNE normalisation, un id fautif est une
    //  erreur, la sauvegarde REFUSE de continuer.
    //  (L'ancien `.replace(/\W+/g,'_')` masquait la faute et n'était pas injectif :
    //   « a b » et « a-b » écrivaient dans les MÊMES fichiers.)
    const proj = el.id;
    if (!TsiStart.ID_FORMAT.test(proj))
      TsiError.error(`sauvegarde : la racine <${el.localName}> porte l'id « ${proj || '(aucun)'} » `
        + `— il faut un nom de variable : lettres, chiffres et _, ne commençant pas par un chiffre`);

    //  LA MÉMOIRE DES NOMS D'ATTRIBUTS S'OUVRE ICI, UNE FOIS. Le data-tsi émet
    //  des POSITIONS dedans (`3, 0 = 42` = entier-code 0, place 3) et le fichier
    //  compagnon la publie à la fin : la table publiée DOIT être celle qui a
    //  servi à écrire les positions.
    TsiAttrsOutService.reset();
    //  La récolte des scripts de l'auteur — un Set (dédoublonnage sur le texte),
    //  ouvert AVANT la passe, rempli par TsiValUserJs.debuild, supprimé après
    //  l'assemblage : il ne vit QUE le temps du debuild de la branche.
    o_.projet.userJs = new Set();
    const branches = TsiDecompiler.exportBranch(el, '  ', null, false);   // LA branche — la récursive fait le reste

    //  LA PAGE — le MODÈLE (constante, structure fixe) dont on remplit les ZONES.
    //  Aucune capture du head vivant, aucune regex : le modèle est à nous.
    let html = TSI_HTML_HEADER;
    html = TsiDecompiler._fillZone(html, 'tispi_name',       proj);
    html = TsiDecompiler._fillZone(html, 'tispi_player',     TSI_PLAYER);
    html = TsiDecompiler._fillZone(html, 'tispi_project_js', `\n    <script src="tsi_${proj}.js"></script>\n    `);
    html = TsiDecompiler._fillZone(html, 'tispi_js_user',    TsiDecompiler._userJsList());
    html += branches
          + `\n\n  <script>o_.start(null, ${Tsi_.frameDuration});</script>\n</body>\n</html>\n`;

    //  FICHIER PROJET — le code ENGENDRÉ propre à CETTE page : la table de noms
    //  d'attributs, que decodeAttrs relira. JS NU, aucune balise.
    //  (Les fonctions n'y sont PLUS : une fonction d'auteur vit soit dans un
    //   script Tispi — elle voyage dans le data-tsi de son bloc —, soit dans un
    //   fichier JS déclaré par `$$monJs`, dont le LIEN est régénéré dans la zone
    //   tispi_js_user. Le fichier lui-même n'est jamais réécrit.)
    const projet =
`// Fichier projet Tispi — ENGENDRÉ à la sauvegarde. Code débogable (hors HTML inline).
${TsiDecompiler._attrsCodeBlock()}`;

    delete o_.projet.userJs;                    // la table ne vit QUE le temps du debuild
    return { [`${proj}.html`]: html, [`tsi_${proj}.js`]: projet };
  }

  //  ═══ LES ZONES DU MODÈLE ══════════════════════════════════════════════════
  //  Remplit une zone `<!--[nom]-->` … `<!--[/nom]-->` du modèle : insertion
  //  APRÈS l'ouvrante. Les zones sont vides dans TSI_HTML_HEADER, il n'y a rien
  //  à effacer. Zone absente du modèle → `replace` sans effet, silencieux.
  //  Voir docs/DOM_INCRUSTATIONS.md pour en ajouter une.
  static _fillZone(html, zone, content) {
    return html.replace(`<!--[${zone}]-->`, `<!--[${zone}]-->${content}`);
  }

  //  Les scripts de l'auteur, récoltés pendant le debuild par TsiValUserJs
  //  (les `$$monJs`), dédoublonnés par le Set — UNE ligne pour en faire la liste.
  static _userJsList() {
    const js = [...(o_.projet?.userJs ?? [])];
    return js.length ? '\n    ' + js.join('\n    ') + '\n    ' : '';
  }

  /** Écrit les fichiers du projet sur le serveur (save.php, même dossier).
   *  @returns Promise<{ok, written}|{error}> */
  static saveToServer(el) {                         // `el` = la RACINE de la branche (cf. saveDocument)
    const files = TsiDecompiler.saveDocument(el);
    return fetch('save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files }),
    }).then(r => r.json());
  }

  /** Copie `text` au presse-papier — rend TOUJOURS une Promesse (le handler garde
   *  son .then/.catch). En `file://`, `navigator.clipboard` est ABSENT (contexte
   *  non sécurisé) et son `.writeText` lèverait un TypeError SYNCHRONE hors du
   *  `.catch` → d'où le repli `textarea` + `execCommand('copy')`, qui marche parce
   *  qu'on est DANS le geste clavier (keydown). */
  static copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed; left:-9999px; opacity:0';   // hors écran, pas de reflow visible
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error('execCommand("copy") refusé'));
  }

}


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiGroup.js  (289 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// tispiGroup.js

/**
 * ═══════════════════════════════════════════════════════════════════
 *  TISPI GROUP  —  the Face that opens the door to the tree
 * ═══════════════════════════════════════════════════════════════════
 *
 *  OVERVIEW
 *  ─────────
 *  This script performs no task of its own — none, zero.
 *  It does exactly one thing: forward a message to child divs
 *  that contain a Piece.
 *
 *  That single forwarding step is enough to build a complete tree.
 *  Each child Piece, upon receiving the message, visits its own Faces —
 *  and if one of them is also a TsiGroup, the forwarding continues
 *  one level deeper, and so on.
 *
 *   TsiPiece
 *     ├─ TsiFace    ← leaf: image, text… messagePlate() returns immediately
 *     ├─ TsiFace    ← leaf
 *     └─ TsiGroup   ← branch: contains child Pieces; messagePlate() recurses
 *          ├─ TsiPiece
 *          │    ├─ TsiFace
 *          │    └─ TsiGroup  ← can nest further
 *          └─ TsiPiece
 *               └─ TsiFace
 *
 *  DEPENDENCY
 *  ──────────
 *  This file must be loaded AFTER tispi001.js (TsiFace must exist).
 */


// ═════════════════════════════════════════════════════════════
//  TsiGroup
// ═════════════════════════════════════════════════════════════

/**
 * A Face that contains child Pieces — the structural extension that
 * enables the Piece/Face structure to branch recursively.
 */
class TsiGroup extends TsiFaceDom {

  /**
   * Wraps `parentDiv` as a Group Face.
   *
   * @param {HTMLElement} parentDiv  — the DOM div that acts as the Group container
   */
  constructor(parentDiv) {
    super(parentDiv);
    this.tag = 'tsi-g';               // tag CANONIQUE (surcharge le tsi-f de TsiFace)
  }
  //  LA PIÈCE FILLE — plateau d'états d'un comportement. Elle vit dans la face
  //  COURANTE (Pièce > Face > Pièces filles) ; une face simple n'en a pas → null.
  onePiece() {
    for (const childDiv of this.getFaceCurr()?.children ?? [])
      if (childDiv._tsi) return childDiv._tsi;
    return null;
  }

  /**
   * RULE
   * ____
   *
   * Generic function: visits this Group during tree traversal.
   * Unlike TsiFace.messagePlate(), this override iterates child Pieces.
   *
   * INITIALIZATION
   * ______________
   *
   * This Face ignores the entire message content
   * (see: tispi001.js/TsiTrackClock.start(), where the face callbacks are both null).
   * The tree works because each Piece-Group unit is fully autonomous.
   *
   * PARAMETERS
   * __________
   *
   * @param  {Function|null} onEnterPiece  — passed through to child Pieces
   * @param  {Function|null} onExitPiece   — passed through to child Pieces
   * @param  {Function|null} onEnterFace   — called when entering this Group
   * @param  {Function|null} onExitFace    — called when exiting this Group
   * @param  {object}        params        — mutable traversal state (depth, component…)
   * @returns {'continue'|'break'|'error'}
   */
  messagePlate(onEnterPiece, onExitPiece, onEnterFace, onExitFace, params) {

    // 1 — Notify the traversal engine that we are entering a Group Face
    //     Initialization: onEnterFace is null
    const status = onEnterFace ? onEnterFace(this, params) : "continue";
    if (status === 'break') return 'break';
    if (status === 'error') return 'error';

    // 2 — Visit each child Piece inside this Group
    for (const childDiv of this.div.children) {
      if (childDiv._tsi === undefined) continue;   // skip non-Piece children

      //________________________________________
      // Forwards to child Pieces.
      // Initialization: no other action.
      const result = childDiv._tsi.messageTree(
        onEnterPiece, onExitPiece, onEnterFace, onExitFace, params
      );

      if (result === 'break') return 'break';
      if (result === 'error') return 'error';
    }

    // 3 — Notify the traversal engine that we are exiting this Group Face
    //     Initialization: onExitFace is null
    return onExitFace ? onExitFace(this, params) : "continue";
  }
  getPieces() {
    const pieces = [];
    for (const childDiv of this.div.children)
      if (childDiv._tsi) pieces.push(childDiv._tsi);
    return pieces;
  }
   
  /**
   * Apparition de la face-GROUPE = faire tourner le PLATEAU DE PIÈCES qu'elle
   * contient (symétrique de B pour le plateau racine). On ne démarre QUE si le
   * plateau est encore INACTIF (`frameStop === -1`, l'état posé par A) : un
   * plateau déjà lancé (esclave piloté par son maître, ou en lecture) n'est pas
   * retouché. Les Pièces sœurs partagent UNE horloge → une seule gotoPlayGroup ;
   * chacune montre ensuite sa face courante (cascade). Feuille = pas de Pièce.
   */
  setActivePlate(prevFace) {
    super.setActivePlate(prevFace);

    const firstPiece = this.onePiece();
    const clock = firstPiece?.ptClock;

    if (clock && clock.frameStop === -1)
      clock.gotoPlayGroup(0);
  }

  // Délégués d'INSTANCE — utilisables tant qu'on tient la référence au groupe.
  // ATTENTION : `o_.start` fait `delete div._tsi` sur les groupes (TsiStart.
  // initPieceClock) → l'objet TsiGroup est ÉPHÉMÈRE. Après le start, le handle
  // pratique est le DIV : `TsiGroup.hide(groupDiv, mode)`.
  hide(mode)        { return TsiGroup.hide(this.div, mode); }
  show(mode, frame) { return TsiGroup.show(this.div, mode, frame); }

  // ═══════════════════════════════════════════════════════════════════
  //  EFFACEMENT / APPARITION DE GROUPE  (statiques, sur le DIV de groupe)
  // ═══════════════════════════════════════════════════════════════════
  //  Deux indicateurs orthogonaux passés en PARAMÈTRE. La récursion sur la
  //  sous-branche se fait par BALAYAGE DOM (robuste aux groupes dissous au
  //  start : `messageTree` casse sur leur _tsi supprimé).
  //
  //  GRANULARITÉ = l'HORLOGE, pas la pièce. Un PLATEAU (conteneur de pièces
  //  sœurs) partage UNE horloge ; `clock.gotoStopGroup(f)` gèle tout le plateau
  //  (messageAllTracks). On dé-duplique donc les horloges (sinon on lirait
  //  frameStop d'une horloge déjà remise à null par une pièce sœur). Les
  //  sous-groupes imbriqués portent leurs propres horloges → trouvées aussi.
  //  Les faces (out / ré-affichage) restent traitées par pièce.

  /** Applique `fn` à chaque HORLOGE distincte sous le div de groupe. */
  static _eachClock(groupDiv, fn) {
    const seen = new Set();
    for (const el of groupDiv.querySelectorAll('*')) {
      const c = el._tsi?.ptClock;
      if (c && !seen.has(c)) { seen.add(c); fn(c); }
    }
  }
  /** Applique `fn` à chaque PIÈCE descendante (pour l'out / le ré-affichage de face). */
  static _eachPiece(groupDiv, fn) {
    for (const el of groupDiv.querySelectorAll('*'))
      if (el._tsi instanceof TsiPiece) fn(el._tsi);
  }

  /**
   * Efface le groupe ET toute sa sous-branche (sous-groupes compris).
   * @param {HTMLElement} groupDiv
   * @param {'immediat'|'continue'|'out'} [mode='out']
   *   'immediat' — gèle chaque plateau (gotoStopGroup à la frame courante →
   *                frameStop mémorisé) puis masque le conteneur instantanément.
   *   'out'      — gèle les plateaux ET chaque pièce joue l'out de sa face
   *                courante (relais OUT, playOut) ; les faces se masquent en fin d'out.
   *   'continue' — ne touche RIEN : la sous-branche reste visible et poursuit
   *                son animation ; le retrait effectif est DIFFÉRÉ à la fin de
   *                l'animation de la pièce parente (puis ≈ 'immediat').
   */
  static hide(groupDiv, mode = 'out') {
    if (mode === 'continue') { TsiGroup._deferRemoval(groupDiv); return; }
    TsiGroup._eachClock(groupDiv, (clock) =>
      clock.gotoStopGroup(TsiTrackClock.getFrameNum(clock)));          // gèle le plateau (frameStop)
    if (mode === 'out')
      TsiGroup._eachPiece(groupDiv, (piece) => piece.getFaceCurr()?._tsiFace?.onHide?.(true));  // out de face
    if (mode === 'immediat') groupDiv.style.display = 'none';          // masquage instantané
  }

  /**
   * Fait réapparaître le groupe ET toute sa sous-branche.
   * @param {HTMLElement} groupDiv
   * @param {'temps0'|'predefini'|'dernierEffacement'} [mode='temps0']
   * @param {number} [frame=0] — frame cible (mode 'predefini')
   *   'temps0'            — chaque plateau repart à 0.
   *   'predefini'         — chaque plateau se poste à `frame`.
   *   'dernierEffacement' — chaque plateau reprend à sa frame de gel (frameStop).
   */
  static show(groupDiv, mode = 'temps0', frame = 0) {
    TsiGroup._cancelDefer(groupDiv);                // annule un retrait 'continue' en attente
    groupDiv.style.display = '';                    // restaure le conteneur
    TsiGroup._eachClock(groupDiv, (clock) => {
      const f = (mode === 'temps0')    ? 0
              : (mode === 'predefini') ? frame
              : (clock.frameStop ?? 0);             // 'dernierEffacement' (1 horloge → 1 lecture)
      clock.gotoPlayGroup(f);
    });
    TsiGroup._eachPiece(groupDiv, (piece) => piece.getFaceCurr()?._tsiFace?.setActivePlate?.());  // restaure faces out
  }

  /** Retrait DIFFÉRÉ ('continue') : déclenché à la fin d'animation de la pièce parente. */
  static _deferRemoval(groupDiv) {
    TsiGroup._cancelDefer(groupDiv);
    const clock = groupDiv.parentNode?._tsi?.ptClock;    // horloge de la pièce parente
    if (!clock) return;                                   // parent non animé → reste visible
    const remaining = Math.max(0, (clock.animDuration ?? 0) - TsiTrackClock.getFrameNum(clock));
    groupDiv._deferTimer = setTimeout(
      () => { groupDiv._deferTimer = null; TsiGroup.hide(groupDiv, 'immediat'); },
      Tsi_.frameToMs(remaining));
  }
  static _cancelDefer(groupDiv) {
    if (groupDiv._deferTimer) { clearTimeout(groupDiv._deferTimer); groupDiv._deferTimer = null; }
  }
}

// Un Group suit aujourd'hui le même processus de construction qu'une Face,
// mais dispose de son propre Builder afin de porter ses règles spécifiques
// sans modifier TsiFaceBuilder.
class TsiGroupBuilder extends TsiFaceBuilder {}

tsiTag('tsi-g', el => {
    const group = new TsiGroup(el);
    new TsiGroupBuilder(group);
});

// ═════════════════════════════════════════════════════════════
//  TsiFaceGroupInteractive
// ═════════════════════════════════════════════════════════════

/**
 * Groupe-Face réactif à la souris — bouton ou roll-over.
 * Contient un plateau de Pieces internes positionnées par état via gotoStop().
 *
 * @param {HTMLElement} parentDiv
 * @param {number}      nbStates  — 2 = roll-over (états 0 / 1)
 *                                  3 = bouton     (états 0 / 1 / 2)
 *
 * États → frames des Pieces internes :
 *   0  normal   (état initial / après mouseleave)
 *   1  survolé  (mouseenter)
 *   2  appuyé   (mousedown — uniquement si nbStates === 3)
 *
 * Non traversée par l'horloge : les Pieces internes n'ont pas de clock
 * (traverser déclencherait un 'break' qui arrêterait l'arbre entier).
 * Initialisation à l'état 0 au premier appel de messagePlate().
 */
class TsiOnMouse extends TsiGroup {
  constructor(parentDiv, nbStates = 3) {
    super(parentDiv);
    this.nbStates = nbStates;

    const div = this.div;

    TsiDomListener.add(this, div, 'mouseenter', () => this.onePiece()?.gotoStopGroup(1));
    TsiDomListener.add(this, div, 'mouseleave', () => this.onePiece()?.gotoStopGroup(0));
    if (nbStates >= 3) {
      TsiDomListener.add(this, div, 'mousedown', () => this.onePiece()?.gotoStopGroup(2));
      TsiDomListener.add(this, div, 'mouseup',   () => this.onePiece()?.gotoStopGroup(1));
    }
  }

  /**
   * Même traversal que TsiGroup (clock créée, Pieces synchronisées),
   * mais stoppe l'animation à l'état 0 dès la fin de l'initialisation.
   */
  messagePlate(onEnterPiece, onExitPiece, onEnterFace, onExitFace, params) {
    const next = super.messagePlate(onEnterPiece, onExitPiece, onEnterFace, onExitFace, params);

    // Stopper immédiatement à l'état 0 — sinon l'animation boucle sur les frames d'état
    this.onePiece()?.gotoStopGroup(0);

    return next;
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiLayout.js  (424 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// tispiLayout.js





/**
 * ═══════════════════════════════════════════════════════════════════
 *  TISPI LAYOUT  —  TsiLayoutGroup (pistes posBar)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  DÉPENDANCES
 *  ───────────
 *  Doit être chargé APRÈS tispi001.js et tispiGroup.js.
 *
 *  PRINCIPE
 *  ────────
 *  TsiLayoutGroup est un groupe-Face. À chaque changement de dimension
 *  (ResizeObserver) ou de valeur de piste posBar, il recalcule les
 *  coordonnées de toutes ses Pièces et les applique en
 *  position:absolute + left/top/width/height.
 *
 *  Pas de CSS insets (right/bottom) — coordonnées pures.
 *  Pas de transition sur les pistes posBar.
 *
 *  ORDRE DE CALCUL
 *  ───────────────
 *  Les Pièces sont traitées dans l'ordre du DOM.
 *  Une Pièce peut référencer la zone restante d'une Pièce placée AVANT elle.
 *
 *  VALEUR D'UNE KEY posBar  (voir tispi001.js / TsiCssPosBar)
 *  ───────────────────────
 *    [ ref, dir, size ]
 *
 *    ref   "_parent"  → rect du groupe
 *          "pieceId"  → remaining de la Pièce sœur nommée
 *    dir   "top" | "bottom" | "left" | "right" | "fill"
 *    size  pixels — absent pour dir:"fill"
 *
 *  CALCUL ZONE
 *  ───────────
 *  Chaque piste posBar mémorise deux zones calculées :
 *    track.rect      {x,y,w,h}  zone occupée par la Pièce
 *    track.remaining {x,y,w,h}  zone restante après découpe
 *
 *  DÉCLENCHEMENT DE reconstructLayout()
 *  ─────────────────────────────────────
 *  setCss remonte le DOM : pieceMaster.div.parentNode._tsiFace
 *  Si c'est un TsiLayoutGroup → reconstructLayout().
 *  La piste ne stocke aucune référence vers son conteneur.
 *
 *  Note _tsiFace : la remontée ne peut pas passer par div._tsi —
 *  TsiStart.initPieceClock() fait `delete div._tsi` sur les divs de
 *  groupe au démarrage (nettoyage de la mémoire temporaire du plateau).
 *  TsiLayoutGroup pose donc une référence stable div._tsiFace.
 */
// ═════════════════════════════════════════════════════════════
//  LAYOUT GROUP — l'élément <tsi-layout> : un GROUPE-Face ordinaire.
//  Le layout NE VIT PAS dans le conteneur : il vit dans les PISTES des
//  Pièces enfants (posBar/barTop → compute + areaRemainder sur le plateau,
//  TsiResizer au window-resize). La classe n'existe que pour l'IDENTITÉ
//  du nœud (traversée de l'arbre en phase A) et ses spécifiques futurs.
//  (L'ancien modèle de groupe — reconstructLayout/cut/remaining, cf. a100 —
//  est REMPLACÉ par compute/areaRemainder ci-dessous : ne pas le ressusciter.)
// ═════════════════════════════════════════════════════════════
class TsiLayoutGroup extends TsiGroup {
}

tsiTag('tsi-layout', el => { const layoutGroup = new TsiLayoutGroup(el); new TsiFaceBuilder(layoutGroup); });
tsiTag('sti-layout', el => { const layoutGroup = new TsiLayoutGroup(el); new TsiFaceBuilder(layoutGroup); });

// ═════════════════════════════════════════════════════════════
//  INTÉGRATION posBar — complète le TODO de tispi001.js/TsiCssPosBar
// ═════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
//  PISTE posBar  —  position + dimension calculées par découpe de zone
//
//  Valeur de key : [ ref, dir, size ]
//    ref   "_parent"  → zone du groupe parent
//          "pieceId"  → zone restante d'une pièce sœur (TODO)
//    dir   "top" | "bottom" | "left" | "right" | "fill"
//    size  pixels — absent pour "fill"
//
//  Deux domaines : position + dimension
//  Pas de transition CSS (layout recalculé à chaque setCss).
// ═══════════════════════════════════════════════════════════════════
class TsiResizer   {
static resize(piece) {
  const clock = piece.ptClock;
  const frame = clock ? TsiTrackClock.getFrameNum(clock) : 0;   // 0 si plateau inactif
  piece.timeline?.forTracks((track) => {
    if (track.constructor.resizableAuto) {
      track.setCssCurr();  // key ACTIVE à frame (discret) — setCss est sur le css, pas la piste
    }
  });
}

  // les 3 hooks de reset, utilisés par resizeTree
  static _hooks() {
    // reset per-pièce (vierge avant que ses dépendantes le lisent) + align de la pièce
    const onEnterPiece = (p) => { p.areaRemainder = null; TsiResizer.resize(p); return "continue"; };
    // reset SECONDAIRE de &clock (assurance, si la sortie précédente a raté)
    const onEnterPlate = (p0) => { if (p0.ptClock?.areaRemainder != null) p0.ptClock.areaRemainder = null; };
    // reset PRIMAIRE de &clock (vidage normal à la sortie du plateau)
    const onLeavePlate = (p0) => { if (p0.ptClock) p0.ptClock.areaRemainder = null; };
    return [onEnterPiece, null, onEnterPlate, onLeavePlate];
  }

  // sweep complet depuis une racine (window-resize)
  static resizeTree(piece, params) {
    const [a, b, c, d] = TsiResizer._hooks();
    piece.messagePieceTree(a, b, c, d, params);
  }

}

// ══ REDIMENSIONNEMENT : la fenêtre change → re-dock le plateau. Le listener vit ICI
//    (concern de layout) et PAS dans tispi001.js : une page sans tispiLayout.js ne doit
//    pas dépendre de TsiResizer. Enregistré au chargement, il fire au resize (après start).
//    tsiAlign statique = responsive au viewport ; window.resize n'est pas causé par nos
//    écritures → aucune rétroaction.
window.addEventListener('resize', () => {
  const root = [...document.body.children].find(d => d._tsi)?._tsi;
  if (root) TsiResizer.resizeTree(root);
});

class TsiTrackPosBar extends TsiTrack {
  static resizableAuto = true;   // ce TYPE de piste se recalcule au resize (lu par TsiResizer.resize sur track.constructor)
}

class TsiKeyPosBar extends TsiKeyCss {
  constructor(numFrame, value) { super(numFrame, value, 'posBar'); }
  // vérifier si le parent possède un piste "align"
  // rechercher la piste $clock
  // copier lee listener d
}

class TsiCssPosBar extends TsiCssBase {
  static domainNames = ['position', 'dimension'];  // deux domaines
  static track       = TsiTrackPosBar;
  static key         = TsiKeyPosBar;
  static defaultValue = ['_parent', 'fill'];

  constructor(pieceMaster) {
    super(pieceMaster);
    this.transit = null;   // pas de transition CSS
  }
  setCss(value, _track) {
    // Valeur TOUJOURS réifiée (invariant amont) → résolution au consommateur, SANS
    // test. Le tuple résout ses cellules : `_parent` est un PATH → sa get() rend la
    // PIÈCE parente (objet) ; une sœur nommée (`barTop`) reste une STRING (ident nu).
    value = value.get(this.pieceMaster);
    const r = this.compute(value);
    const s = this.pieceMaster.div.style;
    s.position = 'absolute';
    s.left = r.x + 'px'; s.top = r.y + 'px'; s.width = r.w + 'px'; s.height = r.h + 'px';
    if (this.pieceMaster.faceCurr != this.pieceMaster.div) {
      const f = this.pieceMaster.faceCurr;
      f.style.position = 'absolute';
      f.style.left = '0px'; f.style.top = '0px'; f.style.width = r.w + 'px'; f.style.height = r.h + 'px';
    } 
  }

  // compute : R1 (source) + R2 (3 temps)
  //   ref "_parent" → restant sur &clock (ptClock), dims sur la pièce parent
  //   ref "<id>"    → restant ET dims sur la sœur nommée (accès direct children[id])
  compute(value) {
    const [ref, dir, size] = value;
    // `ref` : '_parent' (string : defaultValue/pseudo-key) OU la PIÈCE PARENTE
    // (produit du path `_parent` réifié) → même sens : la zone du plateau parent.
    const isParent = (ref === '_parent') || (ref?.isPiece && ref === this.pieceMaster.getPieceParent());

    // R2.1 — la source du restant
    const holder = isParent
        ? this.pieceMaster.ptClock
        : (ref?.isPiece ? ref                                          // sœur rendue par un path
                        : this.pieceMaster.div.parentNode.children[ref]._tsi);   // sœur nommée (string)

    // R2.2 — lazy-init si null : la FEUILLE = le CONTENEUR DIRECT de la pièce
    // dockée (le div du groupe/layout — ex. 100vw×100vh d'un tsi-layout), origine
    // 0,0 = son coin (c'est l'offsetParent des pièces dockées). PAS
    // getPieceParent() : la PIÈCE ancêtre SAUTE le conteneur non-pièce et mesure
    // un div sans dimensions (0×0 → tout se calait au coin de la fenêtre).
    if (holder.areaRemainder == null) {
      if (isParent) {
        const d = this.pieceMaster.div.parentNode;
        holder.areaRemainder = { x: 0, y: 0, w: d.clientWidth, h: d.clientHeight };
      } else {
        holder.areaRemainder = this.boxOf(holder);                 // rect POSÉ de la sœur
      }
    }

    // R2.3 — découpe (pos + dim) puis rogne la source
    const zone = holder.areaRemainder;
    const sz   = this.resolveSize(size, dir, zone);   // '%' → px (résolu AVANT setAlign ET remainderAfter, sinon le complément casse)
    const rect = this.setAlign(dir, sz, zone);
    holder.areaRemainder = this.remainderAfter(dir, sz, zone);
    return rect;
  }

  // profondeur de bande → px, selon la dimension du bord (left/right → largeur de la zone ; top/bottom → hauteur).
  //   pcOffset [pc, offset] : pc%·dim + offset (null → 0)   |   '%' nu : pc%·dim   |   nombre : px tel quel
  resolveSize(size, dir, z) {
    const base = (dir === 'left' || dir === 'right') ? z.w : z.h;
    if (Array.isArray(size))
      return (size[0] != null ? size[0] / 100 * base : 0) + (size[1] != null ? size[1] : 0);
    if (typeof size === 'string' && size.endsWith('%'))
      return parseFloat(size) / 100 * base;
    return size;
  }

  // rect posé d'une pièce, repère plateau (la sœur a déjà été placée dans le balayage)
  boxOf(piece) {
    const d = piece.div;
    if(piece.face != null){
   
      return { x: d.offsetLeft, y: d.offsetTop, w: d.clientWidth, h: d.clientHeight };
    }
    const f = piece.faceCurr;
    if(f!=null && f.clientWidth!="" && f.clientHeight!=""){
      return { x: f.offsetLeft, y: f.offsetTop, w: f.clientWidth, h: f.clientHeight };
    }
    return { x: d.offsetLeft, y: d.offsetTop, w: d.clientWidth, h: d.clientHeight };
  }
  // setAlign : le rect PROPRE (découpe [dir,size] dans zone)
  setAlign(dir, size, z) {
    switch (dir) {
      case 'top':    return { x: z.x,              y: z.y,               w: z.w,  h: size };
      case 'bottom': return { x: z.x,              y: z.y + z.h - size,  w: z.w,  h: size };
      case 'left':   return { x: z.x,              y: z.y,               w: size, h: z.h };
      case 'right':  return { x: z.x + z.w - size, y: z.y,               w: size, h: z.h };
      case 'fill':   return { x: z.x,              y: z.y,               w: z.w,  h: z.h };
      case 'center': return { x: z.x,              y: z.y,               w: z.w,  h: z.h };  // toute la zone (cf. ancien cut)
      default:       return { x: 0, y: 0, w: 0, h: 0 };
    }
  }

  // remainderAfter : le COMPLÉMENT (ce qui reste après la découpe)
  remainderAfter(dir, size, z) {
    switch (dir) {
      case 'top':    return { x: z.x,        y: z.y + size, w: z.w,        h: z.h - size };
      case 'bottom': return { x: z.x,        y: z.y,        w: z.w,        h: z.h - size };
      case 'left':   return { x: z.x + size, y: z.y,        w: z.w - size, h: z.h };
      case 'right':  return { x: z.x,        y: z.y,        w: z.w - size, h: z.h };
      case 'fill':   return { x: z.x,        y: z.y,        w: z.w,        h: z.h };  // fill NE rogne pas
      case 'center': return { x: z.x,        y: z.y,        w: 0,          h: 0   };  // center ÉPUISE la zone (cf. ancien cut)
      default:       return { ...z };
    }
  }
}

o_.css.posBar = TsiCssPosBar;
class TsiTrackBarTop extends TsiTrackPosBar {}

class TsiKeyBarTop extends TsiKeyPosBar {}   // la valeur RÉIFIÉE reste INTACTE dans la key

class TsiCssBarTop extends TsiCssPosBar {
  static defaultValue = ['_parent', 0];
  static track = TsiTrackBarTop;
  static key   = TsiKeyBarTop;
  // barTop = RACCOURCI [ref, size] : le 'top' est inséré ICI, sur la valeur
  // RÉSOLUE (setCss a déjà fait value.get) — l'ancien ctor TsiKeyBarTop indexait
  // value[0]/value[1] sur l'OBJET réifié → [undefined,'top',undefined].
  compute(value) {
    const [ref, size] = value;
    return super.compute([ref, 'top', size]);
  }
}

o_.css.barTop = TsiCssBarTop;


// ═══════════════════════════════════════════════════════════════════
//  PISTE framing — placement LIBRE (DISPOSÉES / cadre), superposé,
//  NE consomme PAS d'areaRemainder. Position + origine (ancre) + dimension,
//  chacune en %conteneur + offset px, chaque valeur optionnelle (null → 0).
//
//  DSL (plat) : &framing ref, x%,xPx, y%,yPx, xAxe%,xAxePx, yAxe%,yAxePx, lg%,lgPx, ht%,htPx
//  Table (groupée) : [ref, [X,Y], [X,Y], [W,H]]  où chaque coord = [pc, px]
//
//    left  = pos.x%·C.w + pos.x.px − (ori.x%·pièce.w + ori.x.px)   (idem y)
//    width = dim.w%·C.w + dim.w.px                                  (idem h)
// ═══════════════════════════════════════════════════════════════════
class TsiTrackFraming extends TsiTrack {
  static resizableAuto = true;   // recalculé au resize (comme posBar), via setCssCurr
}

class TsiKeyFraming extends TsiKeyCss {
  // La valeur RÉIFIÉE reste INTACTE dans la key (forme DSL plate : ref + 6 pcOffset).
  // Le REGROUPEMENT [ref,[x,y],[ax,ay],[w,h]] se fait dans compute, sur le RÉSOLU
  // (l'ancien ctor déstructurait l'OBJET réifié → undefined partout).
  constructor(numFrame, value) { super(numFrame, value, 'framing'); }
}

class TsiCssFraming extends TsiCssPosBar {   // réutilise setCss (remplissage de face) + boxOf ; n'override QUE le placement
  static domainNames = ['position', 'dimension'];
  static track        = TsiTrackFraming;
  static key          = TsiKeyFraming;
  static defaultValue = ['_parent', [null,null], [null,null], [null,null], [null,null], [null,null], [null,null]];  // défaut = tout neutre → pure CSS (forme DSL PLATE : ref + 6 pcOffset)

  // conteneur en BOÎTE PLEINE (composition superposée, PAS d'areaRemainder) :
  //   _parent → le CONTENEUR DIRECT (div.parentNode — ex. tsi-g 100vw×100vh),
  //   origine (0,0) = son coin (offsetParent) ; <id> → boîte POSÉE de la sœur.
  //   `ref` : '_parent' (string : defaultValue) OU la PIÈCE PARENTE (produit du
  //   path `_parent` réifié) — même sens. (Cf. TsiCssPosBar.compute : mêmes règles.)
  containerBox(ref) {
    const isParent = (ref === '_parent') || (ref?.isPiece && ref === this.pieceMaster.getPieceParent());
    if (isParent) {
      const d = this.pieceMaster.div.parentNode;
      return { x: 0, y: 0, w: d.clientWidth, h: d.clientHeight };
    }
    const sib = ref?.isPiece ? ref : this.pieceMaster.div.parentNode.children[ref]._tsi;
    return this.boxOf(sib);
  }

  // NIVEAU A — coordonnée [pc, px] → nombre, ou NULL si NEUTRE (les DEUX à ~) → prop CSS non écrite (pass-through).
  // NIVEAU B — à l'intérieur, ~ ≡ 0 (terme % ou px absent = 0 dans la somme).
  coord(co, base) {
    return (!co || (co[0] == null && co[1] == null)) ? null
      : (co[0] != null ? co[0] / 100 * base : 0) + (co[1] != null ? co[1] : 0);
  }

  compute(value) {
    // Forme DSL PLATE résolue [ref, x, y, ax, ay, w, h] (chaque coord = pcOffset
    // [pc, px]) → REGROUPEMENT ici : pos/ori/dim.
    const [ref, fx, fy, fax, fay, fw, fh] = value;
    const pos = [fx, fy], ori = [fax, fay], dim = [fw, fh];
    const c = this.containerBox(ref);
    const w  = this.coord(dim[0], c.w);                          // → width  (null = neutre)
    const h  = this.coord(dim[1], c.h);                          // → height
    const px = this.coord(pos[0], c.w);                          // → left
    const py = this.coord(pos[1], c.h);                          // → top
    const ox = this.coord(ori[0], w ?? 0);                       // ancre en % de la PIÈCE ; dim neutre → base 0 (ancre% exige une dim ; ancre px marche seule)
    const oy = this.coord(ori[1], h ?? 0);
    return {                                                     // 4 sorties INDÉPENDANTES ; null = neutre (non écrit → CSS)
      x: px == null ? null : c.x + px - (ox ?? 0),
      y: py == null ? null : c.y + py - (oy ?? 0),
      w, h,
    };
  }

  // n'écrit QUE les coordonnées non-neutres (une neutre laisse la prop CSS transparaître) ;
  // face séparée = remplit le piece par inset:0 (robuste quand la boîte est en partie CSS).
  setCss(value, _track) {
    value = value.get(this.pieceMaster);   // valeur TOUJOURS réifiée (invariant amont) → get() nu
    const r = this.compute(value);
    const s = this.pieceMaster.div.style;
    s.position = 'absolute';
    if (r.x != null) s.left   = r.x + 'px';
    if (r.y != null) s.top    = r.y + 'px';
    if (r.w != null) s.width  = r.w + 'px';
    if (r.h != null) s.height = r.h + 'px';
    if (this.pieceMaster.faceCurr != this.pieceMaster.div) {
      const f = this.pieceMaster.faceCurr.style;
      f.position = 'absolute';
      f.inset = '0';
    }
  }
}

o_.css.framing = TsiCssFraming;


// ═══════════════════════════════════════════════════════════════════
//  PISTE cssAnchor — CSS ANCHOR POSITIONING natif, ANIMÉ (animate dédié).
//  Positionne la pièce relativement à une SŒUR NOMMÉE (l'ancre), SANS imbrication
//  DOM — le modèle Tispi (référence par nom, DOM plat) rendu natif. La sœur cible
//  déclare `anchor-name: --nom`. (Le `--` est la syntaxe des noms d'ancre, PAS une variable.)
//
//  Valeur : [ nomAncre, left, top, width, height ]
//    - nomAncre : id de la sœur ancre → `position-anchor: --nom`
//    - left/top/width/height : pcOffset `pc%offset` (numérique) ou null → prop non écrite
//      · inset (left/top)   : pc% = position LE LONG de l'ancre → `anchor(--nom pc%)` (+ offset px)
//      · taille (width/height) : pc% = proportion de la dim de l'ancre → `anchor-size(--nom dim) * pc/100` (+ offset px)
//  Ex. : &cssAnchor 0: barTop, 50%20, 30%0, +%150, +%80;
//    → { positionAnchor:"--barTop", left:"calc(anchor(--barTop 50%) + 20px)",
//        top:"calc(anchor(--barTop 30%) + 0px)", width:"calc(150px)", height:"calc(80px)" }
//
//  Cible = le div PIÈCE. Animée → branche TsiCssAnimated (gardes instanceof) sans toucher tispi001.js.
// ═══════════════════════════════════════════════════════════════════
//  (TsiTrackCssAnchor SUPPRIMÉE le 2026-08-20 — coquille VIDE : le rôle est déclaré en
//   ATTRIBUT par la classe Css (`static track`), son comportement vit dans le
//   css composé. `static track` pointe désormais sur TsiTrack.)

class TsiKeyCssAnchor extends TsiKeyCss {
  constructor(numFrame, value) { super(numFrame, value, 'cssAnchor'); }
}

class TsiCssCssAnchor extends TsiCssAnimated {   // cible = this.pieceMaster.div (hérité) ; animate dédié hérité
  static domainNames = ['position', 'dimension'];      // FAMILLES : inset (left/top) + taille (width/height)
  static track = TsiTrack;
  static key   = TsiKeyCssAnchor;
  static props = ['left', 'top', 'width', 'height'];   // coord i → prop CSS (0,1 = inset ; 2,3 = taille)

  // value = [ nomAncre, left, top, width, height ] ; coord = pcOffset [pc, offset] ou null (null détecté par le PARSER)
  toKeyframe(value) {
    const list = Array.isArray(value) ? value : [value];
    const [name, ...coords] = list;
    const A  = `--${name}`;
    const kf = { positionAnchor: A };                    // l'ancre : toujours posée
    const P  = this.constructor.props;
    coords.forEach((co, i) => {
      if (co == null || !P[i]) return;
      const [pc, off] = co;
      const terms = [];
      if (pc  != null) terms.push(i < 2 ? `anchor(${A} ${pc}%)` : `anchor-size(${A} ${P[i]}) * ${pc}/100`);
      if (off != null) terms.push(`${off}px`);
      if (terms.length) kf[P[i]] = `calc(${terms.join(' + ')})`;
    });
    return kf;
  }
}

o_.css.cssAnchor = TsiCssCssAnchor;

// $$cssAnchor (ATTRIBUT, permanent) : la pièce est une ANCRE/conteneur → `anchor-name: --{id}`,
// posé une fois en passe A (applyAttrCss). « Conteneur ou non » ne change pas dans la vie de la
// pièce → ATTRIBUT, pas paramètre de piste. Les autres pièces la référencent par son id
// (piste &cssAnchor : `anchor(--id …)` ; zone contenante : `position-area` via `position-anchor:--id`).
o_.attrBehavior.cssAnchor = { css: (div) => { if (div.id) div.style.setProperty('anchor-name', '--' + div.id); } };




// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiFuncs.js  (820 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// TispiFunc.js
/*
TODO

insertKey(), insertKeyRaw(), deleteKey() : les bornes de transaction sont celles de l'appelant (drag, &onTime, &onClick…) — pas de transaction interne. Le parse d'action est synchrone, donc la transaction est ouverte au moment du run. Les actions qui appellent ces atomes doivent être dans une transaction (ex. &onTime 0:{ insertKey… }).
=> placer un relais utilisateur pour ces actions pour documentation.

---


Dettes immédiates (réorganisation des fonctions)

knownFunctions — tispi001.js:3875 : lister aussi le projet dans le message « fonction inconnue » :
TsiCompiler.knownFunctions = () => [...Object.keys(o_.functions), ...Object.keys(o_.funcProject)];
Include tispiFuncs.js dans toutes les pages HTML qui chargent tispi001.js (après lui, avant o_.start) — sans ça, actions et insertKey sont morts en silence.
Étape funcModule
3. Registre o_.funcModule[moduleName][funcName] ; moduleName = alias posé à l'instanciation en cas de conflit.
4. searchFunc contextuel : searchFunc(funcName, piece) — remonter Pièce → module, résoudre dans sa table d'abord.
5. Trancher l'ordre de résolution : module → projet → système (le local gagne) ou système d'abord (insurchargeable).

Moteur — en suspens
6. Key vide de fin (longueur de plateau) : reporté — le parse la traite en borne de durée (l.526, pas de key) ; à raccorder avec setPlateDuration et la persistance de la longueur à la sauvegarde.
7. graftGroup : Pièce sans piste face → la créer (TODO en dur, tispiFuncs.js:150).
8. Undo : charger tispiUndo.js dans les autres pages ; bornes de transaction côté éditeur (drag, élastique) ; rendre la greffe DOM inversable (le Ctrl-Z d'un import retire la key mais pas l'élément greffé).
9. Bug keyIndex périmé (pistes animées) : à revalider après le refactor _regoto/flush — le modèle auto-projetant a peut-être absorbé une partie du fix conçu.

Fond de backlog
10. Macro textuelle récursive des modules &&name (grammaire actée, à coder).
11. Résolution $var dans les paramètres d'action (stub _resolve de TsiFc).
12. Pistes synthétisées (&text) écrites par push direct sans le filtre de priorité Pièce > Face.
13. Writer/réducteur (format d'échange compact, marqueurs de provenance).
*/
// ═════════════════════════════════════════════════════════════════════════════
//  LE SERVICE DE DÉCLARATION DE FONCTION
// ═════════════════════════════════════════════════════════════════════════════
//
//  ⚠ PAS ENCORE BRANCHÉ (2026-08-11) : le service est écrit et éprouvé, mais rien
//    ne l'utilise — les actions ci-dessous vivent toujours dans o_.functions et
//    o_.searchFunc les résout encore. Le branchement — convertir les dix-huit
//    actions en héritières de TsiFuncDeclar, remplacer searchFunc par le service, faire
//    passer les trois portes (.fc, TsiValFunc.get) par exe — viendra ensuite.
//
//  CE QU'IL REMPLACE. Aujourd'hui les déclarations vivent dans trois dictionnaires
//  ouverts posés sur le namespace — o_.functions, o_.funcProject, o_.func_<module> —
//  et o_.searchFunc les résout en BALAYANT toutes les clés de o_ qui commencent par
//  « func ». D'où : un ordre de cascade qui n'est pas celui annoncé (o_.functions
//  commence aussi par « func », donc la boucle l'attrape avant la ligne explicite),
//  n'importe quel futur o_.funcXxx enrôlé sans décision, et aucun typage — un outil
//  du moteur rangé là devenait appelable depuis un script, pour finir en TypeError
//  sur un `.run` absent.
//
//  LES TROIS NIVEAUX. Système et projet ont UN environnement chacun ; les modules
//  en ont N — d'où la table de tables. Les deux étages sont des TABLEAUX NOMMÉS —
//  la clé EST le nom (de fonction, puis de module) : c'est le cas que la règle PD
//  autorise, un registre dont le contenu est inconnu à l'écriture et qui grandit.
//  Ils sont TYPÉS À LA PORTE par `add`, ce qui est l'autre moitié de la règle.
//  Conséquence heureuse : `o_.functions = TSIFC.system` redonne l'accès d'avant,
//  donc searchFunc et l'export n'ont rien à changer.
//
//      TsiFuncsDeclar       LE SERVICE : système · projet · modules, la cascade, exe
//      TsiFuncDeclarTabTab  les environnements de module     (nommés par module)
//      TsiFuncDeclarTab     les fonctions d'UN environnement (nommées par fonction)
//      TsiFuncDeclar        la déclaration — run + signature
//
//  build(tk)/debuild() sont des coquilles : ils liront les signatures et les aides
//  quand le bloc d'édition s'y branchera. ⚠ Ce sera le bloc `<…>` — `~<` est MORT
//  (PD 2026-08-20), la fusion est actée, l'écriture reste à définir. Pour cette
//  étape, signature() reste une chaîne.
// ═════════════════════════════════════════════════════════════════════════════


// ═════════════════════════════════════════════════════════════
//  L'ITEM — une déclaration de fonction
// ═════════════════════════════════════════════════════════════
//  Le parent ne DÉCLARE que le contrat, vide ; chaque fonction l'implémente.
//  `contexte` = l'environnement de l'appel (jamais un seul élément) : la cible,
//  mais aussi d'où part le tir — key franchie, piste, geste d'éditeur. Une
//  fonction d'auteur, à contexte anonyme, TESTE sa source ; elle peut en recevoir
//  UNE ou une COLLECTION (le service décide, d'après la déclaration).
class TsiFuncDeclar {
  constructor(_name) { this._name = _name; }
  run(_context, _params) { }     // surchargé — le geste
  signature()             { }     // surchargé — chaîne, pour cette étape (le bloc `<…>` viendra)
}


// ═════════════════════════════════════════════════════════════
//  L'HÉRITIER GÉNÉRIQUE — une déclaration dont le CORPS vient du SCRIPT
// ═════════════════════════════════════════════════════════════
//  Classe SYSTÈME, écrite une fois : c'est la SEULE par laquelle naissent les
//  fonctions de PROJET et de MODULE. L'auteur n'écrit jamais de classe — il écrit
//  une déclaration dans le texte d'une action ; le builder instancie celle-ci.
//
//      `alert('avant');
//       function $funcName(param0, param1){ … }
//       alert('après'); `
//
//  CE QUE FAIT LE BUILDER, en trois gestes :
//    1. il REPÈRE les `function $nom(args)` — DEUX tokens suffisent : le mot
//       `function` suivi d'un nom À SIGIL. Sans sigil, `function machin(…)`
//       reste du JavaScript de l'auteur, que Tispi ne touche pas ;
//    2. le nom GARDE son sigil (jamais de .slice(1)) et ajoute un
//       enregistrement par fonction ;
//    3. il COMPILE le tout par `new Function`, SANS lui passer `context` ni
//       `params` — sans quoi le corps les capturerait par FERMETURE et se
//       figerait sur la cible du build. Les instructions libres (les `alert`
//       ci-dessus) tirent au build, entre les déclarations.
//
//  À L'APPEL, le service épand : `fn(context, ...params)`. L'auteur nomme donc
//  ses paramètres — `param0`, `param1` — au lieu de lire `params[0]`, et chaque
//  tir apporte les siens.
//
//  `src` est CONSERVÉE : c'est elle qui se ré-émet à l'export. La déclaration
//  voyage dans le data-tsi de sa branche, elle n'a pas de compartiment JS à part.
class TsiValFuncDeclar extends TsiFuncDeclar {
  /** 
   * @param {string}   _name   le nom déclaré
   * @param {Function} fn      le compilé — signature (context, ...params) 
   * @param {string}   signature la signature — chaîne, pour cette étape (le bloc `<…>` viendra)
   */
  constructor(_name, fn, signature) {
    super( _name );
    this._fn   = fn;              // la fonction NOMME ses paramètres
    this._signature = signature;
  }
  run(context, params) { return this._fn(context, ...params); }
  signature()          { return this._signature; }

  // ── LE BUILDER ────────────────────────────────────────────────────────────
  //  function $nom(p0, p1) { … }        — le sigil FAIT la déclaration Tispi
  //
  //  Deux fonctions, et rien d'autre : `match` regarde, `build` lit et DÉPOSE. Le
  //  builder ne touche à aucune structure extérieure — ni piste, ni piece.vars, ni
  //  key. Son unique effet est la ligne finale : la déclaration entre dans la table
  //  des fonctions Tispi.

  /** `function` suivi d'un NOM À SIGIL. Testé SANS consommer : le jeton reste posé
   *  sur `function` en sortie, comme TsiJs.build le laisse sur son `{`.
   *  ⚠ DEUX TOKENS SUFFISENT (PD 2026-08-18) : `function machin(…)` reste du
   *  JavaScript de l'auteur, que Tispi ne touche pas ; `function $machin(…)` est
   *  une déclaration qui entre au registre. Le sigil tranche, comme partout. */
  static match(tk) {
    const t = tk.peek(true);
    //  Le TYPE est exigé : une CHAÎNE dont le contenu est `function` est un token
    //  'string' — même garde que la branche de convertir et les origines de path.
    return t !== TsiTokenizer.END && t.type === 'ident' && t.val === 'function'
        && tk.peekOffset(1)?.type === 'var';
  }

  static build(tk, piece) {
    const debut = tk.peek(true).pos;                   // 'function', ou le nom — retenu pour l'erreur localisée
    if (tk.at('function')) tk.next();                  // le mot est FACULTATIF : `$nom(…){…}` suffit (PD 04/10)

    //  ⚠ DÉSIGNATION DE MODULE — RETIRÉE ICI (PD 2026-08-18). Elle se lisait « au
    //  seul sigil : `$` ne peut pas être un nom de fonction », phrase devenue fausse
    //  puisque le nom PORTE désormais le sigil : la branche capterait le nom.
    //  Elle devra trouver une autre place — chantier `$$module`, laissé ouvert le
    //  12 août. `decl.moduleVar` reste posé (à null) pour que la forme ne change pas.
    const moduleVar = null;

    // 1 — NOM, sigil compris : il RESTE dans le nom (règle des sigils), donc la
    //     déclaration et l'appel s'écrivent pareil — `$maFonc`.
    const tNom = tk.next();
    if (tNom.type !== 'var')
      throw new Error(TsiTokenizer.posError(tk.str, tNom.pos ?? debut, `function : nom à sigil attendu ($maFonc)`));
    const _name = tNom.val;

    // 2 — PARAMÈTRES : les idents entre '(' et son apparié — saut O(1) pour la reprise.
    //     `_ctx_` n'y figure pas : c'est le builder qui l'injecte, en tête (cf. 4).
    const par = tk.next();
    if (par.val !== '(')
      throw new Error(TsiTokenizer.posError(tk.str, par.pos ?? debut, `function ${_name} : '(' attendu`));
    const _params = [];
    while (tk.current < par.posPair) {
      const t = tk.next();
      if (t.type === 'ident') _params.push(t.val);
    }
    tk.current = par.posPair + 1;                      // après ')'

    // 3 — CORPS : un BLOC ORDINAIRE (PD 2026-08-18). `{ … }` définit DÉJÀ du
    //     JavaScript — la forme TsiValActionJS disparaît. Une fonction d'auteur
    //     s'écrit exactement comme une action :
    //     mêmes `$nom`, mêmes paths, même table.
    //  ⚠ RECALÉ À LA COUPE (26/08) : `buildValueSimple` n'a plus de branche `{`
    //  (l'aiguillage capte les blocs en amont) et `TsiJs.out` n'existe plus. Le corps
    //  se construit ICI, directement : bornes INTÉRIEURES aux accolades, et les
    //  PARAMÈTRES passés au parseur — c'est lui qui compile, avec sa table.
    const ouvr = tk.peek(true);
    if (!(ouvr?.type === 'block' && ouvr.val === '{'))
      throw new Error(TsiTokenizer.posError(tk.str, debut, `function ${_name} : corps { … } attendu`));
    tk.next();                                       // '{'
    const corps = new TsiJs(piece, {});
    corps.buildScript(tk, tk.current, ouvr.posPair, _params);   // un corps de fonction : jamais de return posé (2 bis)
    tk.current = ouvr.posPair + 1;                   // reprise APRÈS le '}'

    // 4 — COMPILATION. Le corps CONVERTI référence `_t`, or new Function naît dans la
    //     portée GLOBALE et ne capture rien : la table entre donc en PARAMÈTRE, et une
    //     closure la fournit. `run` n'est pas touché — il appelle `fn(context, ...params)`.
    //     ⚠ `corps.out` et non `corps.src` : c'est le texte CONVERTI qu'on compile,
    //     sinon les `$nom` du corps resteraient des identifiants JS inconnus.
    //  Le corps s'est compilé lui-même (params compris) ; la TABLE est figée au
    //  build et fournie par la closure — new Function naît dans la portée globale.
    const table = corps._t;
    const fn = (context, ...args) => corps._fn(context, table, ...args);
    const decl = new TsiValFuncDeclar(_name, fn, [_name, ..._params].join(', '));
    decl.moduleVar = moduleVar;                        // la Pièce-module désignée, si elle l'est

    //  DÉPÔT SUR LA PIÈCE (PD 2026-08-18) — `piece.funcDeclar`, et non plus le registre
    //  global en PROJET. Une fonction est LOCALE à sa Pièce et à sa branche : c'est cette
    //  localité qui protège du masquage (un import amène une AUTRE branche, donc d'autres
    //  fonctions), et c'est elle qui rend sûre la mémorisation de résolution dans _t[i].
    //  ⚠ RESTE À FAIRE — LA CASCADE DE RÉSOLUTION. Le dépôt est ici, mais `exe` cherche
    //  encore modules→projet→système, une cascade GLOBALE. Elle doit devenir
    //  pièce→ancêtres→racine, comme resolveVar remonte pour les variables — auquel cas
    //  `o_.funcs.project` n'a plus d'objet : la racine de branche EST le projet.
    //  Trois points à trancher avant d'écrire : la cascade s'arrête-t-elle à la racine
    //  ou continue-t-elle vers le système (`$log` joignable partout) ; `funcDeclar`
    //  porte-t-il les déclarations nues ou une TsiFuncDeclarTab typée ; et qui fait la
    //  remontée — `exe`, ou `TsiValFuncJs.run` qui a la Pièce sous la main.
    //  SUR LE PORTEUR, quel qu'il soit (PD 2026-08-19) : `funcDeclar` vit sur
    //  TsiNode — Pièce, Face ou Groupe portent également. « Ne jamais interdire ce
    //  qui n'est pas nécessaire d'interdire » : l'ancienne remontée vers la Pièce
    //  (et son refus « aucune Pièce porteuse ») n'avaient plus de raison d'être.
    //  Un groupe RACINE qui déclare ici publie pour TOUTE sa branche — c'est le
    //  domicile des fonctions « de projet ».
    decl.src = tk.str.slice(debut, ouvr.posPair < tk.tokens.length ? tk.tokens[ouvr.posPair].pos + 1 : tk.str.length);   // la déclaration mot pour mot (export)
    return piece.funcDeclar[_name] = decl;
  }
}

// ═════════════════════════════════════════════════════════════
//  LES FONCTIONS D'UN ENVIRONNEMENT
// ═════════════════════════════════════════════════════════════

//  TABLEAU NOMMÉ : la clé est le nom de la fonction, donc l'accès est direct.
//  `_name` — l'identité de la Tab — partage cet espace de clés : `get` et `items()`
//  l'écartent, et `add` REFUSE une fonction ainsi nommée — sans quoi elle effacerait
//  l'identité de la table en silence.
class TsiFuncDeclarTab {
  constructor(_name) { this._name = _name; }

  /** La déclaration nommée `funcName`, ou null. Accès DIRECT par la clé — c'est
   *  ce qui rend le pont gratuit : `o_.functions = TSIFC.system` redonne
   *  `o_.functions['stop']` exactement comme avant, sans toucher à searchFunc
   *  ni à l'export. `_name` est l'identité de la Tab, jamais une fonction. */
  get(funcName) { return funcName === '_name' ? null : (this[funcName] ?? null); }

  /** Les déclarations seules (sans `_name`, qui partage l'espace des clés). */
  items() { return Object.keys(this).filter(k => k !== '_name').map(k => this[k]); }

  /** Enregistre — TYPÉ À LA PORTE : ce qui n'est pas une TsiFuncDeclar n'entre pas.
   *  C'est ce qui empêche un outil du moteur de devenir appelable par un script. */
  add(func) {
    if (!(func instanceof TsiFuncDeclar))
      TsiError.error(`${this._name} : « ${func?._name ?? func} » n'est pas une TsiFuncDeclar — refusée.`);
    if (func._name === '_name')   // sinon elle écraserait l'identité de la Tab, en silence
      TsiError.error(`${this._name} : « _name » est réservé (identité de la table) — fonction refusée.`);
    if (this.get(func._name))
      TsiError.error(`${this._name} : la fonction « ${func._name} » est déjà déclarée.`);
    this[func._name] = func;      // ← la clé EST le nom
    return func;
  }

  /** Exécute — personne ne manipule la déclaration, on demande une exécution. */
  exe(funcName, context, params) {
    const f = this.get(funcName);
    return f ? f.run(context, params) : undefined;
  }

  build(_tk)  { }    // à venir : lire les signatures + aides d'un environnement
  debuild()   { return this.items().map(f => f.signature()).join('\n'); }
}


// ═════════════════════════════════════════════════════════════
//  LES ENVIRONNEMENTS DE MODULE
// ═════════════════════════════════════════════════════════════
//  Rangée par le NOM DU MODULE, comme la Tab l'est par le nom de fonction : deux
//  registres qui grandissent, dont le contenu est inconnu à l'écriture — donc deux
//  tableaux nommés légitimes, et typés à la porte par `add`.
class TsiFuncDeclarTabTab {
  /** L'environnement du module `envName`, ou null. */
  getEnv(envName) { return this[envName] ?? null; }

  /** L'environnement, créé s'il n'existe pas (un module qui déclare sa 1re fonction). */
  openEnv(envName) {
    return this[envName] ??= new TsiFuncDeclarTab(envName);
  }

  /** Les environnements. */
  envs() { return Object.values(this); }

  get(funcName, envName)      { return this.getEnv(envName)?.get(funcName) ?? null; }
  add(func, envName)          { return this.openEnv(envName).add(func); }
  exe(funcName, context, params, envName) {
    return this.getEnv(envName)?.exe(funcName, context, params);
  }

  build(_tk)  { }
  debuild()   { return this.envs().map(env => env.debuild()).join('\n'); }
}


// ═════════════════════════════════════════════════════════════
//  LE SERVICE
// ═════════════════════════════════════════════════════════════
class TsiFuncsDeclar {
  static SYSTEM  = 'system';
  static PROJECT = 'project';

  constructor() {
    this.system  = new TsiFuncDeclarTab(TsiFuncsDeclar.SYSTEM);
    this.project = new TsiFuncDeclarTab(TsiFuncsDeclar.PROJECT);
    this.modules = new TsiFuncDeclarTabTab();
  }

  /** Un environnement par son nom — 'system', 'project', ou un nom de module.
   *  Rend donc toujours une TsiFuncDeclarTab (ou null si le module est inconnu). */
  getEnv(envName) {
    if (envName == null || envName === TsiFuncsDeclar.SYSTEM) return this.system;
    if (envName === TsiFuncsDeclar.PROJECT) return this.project;
    return this.modules.getEnv(envName);
  }

  /** CASCADE — module → projet → système : le LOCAL gagne. L'ordre est écrit ici,
   *  une fois, au lieu d'être le sous-produit d'un balayage de namespace.
   *  `envName` = le module de la branche appelante (absent → projet puis système). */
  get(funcName, envName = null) {
    // TODO if envName==null, chercher dans project, puis dans system

    // Le module de la branche appelante (envName) est prioritaire : c'est le local.
    return (envName ? this.modules.get(funcName, envName) : null)
        ?? this.project.get(funcName)
        ?? this.system.get(funcName);
  }

  /** Enregistre dans l'environnement voulu (système par défaut). */
  add(func, envName = TsiFuncsDeclar.SYSTEM) {
    if (envName === TsiFuncsDeclar.SYSTEM)  return this.system.add(func);
    if (envName === TsiFuncsDeclar.PROJECT) return this.project.add(func);
    return this.modules.add(func, envName);
  }

  /** LE point d'exécution : résout par la cascade, puis appelle. Personne
   *  n'obtient plus la déclaration pour l'appeler soi-même — d'où l'impossibilité
   *  de tomber sur un objet sans `run`. Fonction inconnue → erreur NOMMÉE. */
  /** LA CASCADE LOCALE — nœud → ancêtres → racine (PD 2026-08-18, élargie 19/08).
   *  Une fonction d'auteur est déclarée SUR SON NŒUD (`funcDeclar`, champ de TsiNode :
   *  Pièce, Face ou Groupe), comme une variable l'est dans `vars`, et se résout en
   *  REMONTANT — la MÊME marche que resolveVar : le DOM par parentElement, en lisant
   *  `el._tsi` (une Face pure s'y pose elle-même ; la Pièce prime sur un nœud
   *  fusionné). Le groupe RACINE est donc atteint : ses fonctions valent pour toute
   *  la branche — le domicile « projet ».
   *  Ce qu'elle protège : un `importGroup` amène une AUTRE branche, donc d'autres
   *  fonctions — elles ne peuvent pas masquer celles d'ici. C'est cette localité qui
   *  rend sûre la mémorisation de résolution dans `_t[i]`.
   *  ⚠ Le contexte n'a pas de forme unique : un TsiCtx (actions), un porteur nu
   *  (valeurs de key), ou la cible d'un `fc(…)`. On en extrait le nœud de départ. */
  static fromPiece(funcName, context) {
    const dep = (context?.isPiece || context?.div) ? context : (context?.face ?? context?.piece);
    let sisters = funcName.startsWith('$_');       // `$_nom` : portée de PLATEAU (PD 07/10)
    for (let el = dep?.div; el; el = el.parentElement) {
      const f = el._tsi?.funcDeclar?.[funcName];
      if (f) return f;
      if (sisters && el._tsi?.isPiece) {
        sisters = false;
        for (const s of el._tsi.platePieces()) { const g = s.funcDeclar?.[funcName]; if (g) return g; }
      }
    }
    return null;
  }

  exe(funcName, context, params = [], envName = null) {
    //  LE SYSTÈME D'ABORD (PD 2026-08-18) — `$log`, `$stop`… sont écrites À LA MAIN
    //  dans o_.functions : socle stable, accès direct par la clé, et aucune fonction
    //  d'auteur ne peut les masquer. Puis seulement la cascade locale de la branche.
    const f = this.system.get(funcName)
           ?? TsiFuncsDeclar.fromPiece(funcName, context)
           ?? this.get(funcName, envName);   // ⚠ ancien chemin (modules/projet) — inerte
                                             //   depuis que le dépôt s'est déplacé sur la
                                             //   Pièce ; tombera avec le chantier $$module.
    if (!f) TsiError.error(`fonction « ${funcName} » inconnue`
                         + (envName ? ` (module ${envName})` : '')
                         + ` — connues : ${this.names().join(', ')}`);
    return f.run(context, params);
  }

  /** Tous les noms résolvables, pour les messages d'erreur et l'éditeur. */
  names(envName = null) {
    const n = new Set();
    for (const f of this.system.items())  n.add(f._name);
    for (const f of this.project.items()) n.add(f._name);
    if (envName) for (const f of (this.modules.getEnv(envName)?.items() ?? [])) n.add(f._name);
    return [...n].sort();
  }

  build(_tk)  { }    // à venir : les signatures + aides, par le bloc `<…>`
  debuild()   { return [this.system, this.project, this.modules].map(t => t.debuild()).join('\n'); }
}

o_.funcs = new TsiFuncsDeclar();
o_.funcProject = o_.funcs.project;  // pour compatibilité avec l'existant (searchFunc)
o_.functions  = o_.funcs.system;   // idem

// ── VARIABLES : l'affectation `$nom = valeur` des actions compile en appel
//    setVar — la cible (1er arg de run) = la Pièce qui exécute le geste, d'où
//    part la remontée au déclarant (bac-à-sable vivant à chaque tir).
o_.functions.$setVar = new TsiValFuncDeclar('$setVar',
  (_ctx_, nom, value) => o_.setVar((_ctx_.face ?? _ctx_.piece), nom, value),
  "setVar($nom, valeur) — affecte la variable chez son déclarant (cascade CSS)");

// ── `pathPiece.$nom = valeur` : affectation ADRESSÉE — cherche DANS la pièce
//    ciblée (variables de key + zone de tête), sans remontée.
//   ⚠ Le nom de la variable est celui de la Pièce ciblée, pas celui du déclarant
//   (ex. `pathPiece.$nom = valeur` → la Pièce ciblée reçoit `$nom`, pas le déclarant).
//   ⚠ Le déclarant ne reçoit pas de notification : c'est un effet secondaire, pas un
//   geste de l'auteur. Le déclarant ne peut pas savoir que la variable a changé.
//   ⚠ La cible est la Pièce du pathPiece, pas celle du déclarant : le pathPiece
//   peut être dans une transition, donc dans une autre Pièce que le déclarant.
//  ⚠ Le pathPiece peut être dans une transition, donc dans une autre Pièce que le déclarant. Le pathPiece est la cible, pas le déclarant. Le pathPiece est la Pièce qui reçoit la variable, pas le déclarant.
o_.functions.$setVarIn = new TsiValFuncDeclar('$setVarIn',
  (_ctx_, nom, value) => o_.setVarIn((_ctx_.face ?? _ctx_.piece), nom, value),
  "pathPiece.$nom = valeur — affecte la variable DANS la pièce ciblée");

o_.searchFunc = function (funcName, element) {
    // Cascade : PROJET → MODULES (func_*) → SYSTÈME — le local gagne (TODO n°5 :
    // ordre à confirmer). `element` : réservé au scope contextuel par ORIGINE
    // (résolution dans la table du module de la branche appelante — à venir).
    if (o_.funcProject[funcName]) return o_.funcProject[funcName];
    for (const k in o_)
        if (k.startsWith('func') && o_[k][funcName]) return o_[k][funcName];
    if (o_.functions[funcName]) return o_.functions[funcName];
    return null;
}



// Fonctions SYSTÈME (singletons) — référencées par les actions, ex. &onTime 0:{ alert(msg); }
o_.functions.$alert = new TsiValFuncDeclar('$alert', (_ctx_, message) => alert(message),        "alert, message");
o_.functions.$log  = new TsiValFuncDeclar('$log',   (_ctx_, ...args) => console.log(...args),  "log, ...args");
o_.functions.$_x_  = new TsiValFuncDeclar('$_x_',   (_ctx_) => {},                             "vide");
// ── SONDES de maintenance (réif actions/path) — CONSERVÉES : coût nul, servent à
//    revérifier la chaîne compile→get() à chaque évolution du cœur ────────────────
o_.functions.$tlog  = new TsiValFuncDeclar('$tlog',   (_ctx_, ...args) => console.log('tlog | cible =', (_ctx_.face ?? _ctx_.piece)?.div?.id ?? (_ctx_.face ?? _ctx_.piece), '| params =', args), "tlog, ...args");
o_.functions.$techo = new TsiValFuncDeclar('$techo',  (_ctx_, ...args) => args.length === 1 ? args[0] : args,                                                        "techo, ...args");
o_.functions.$tid   = new TsiValFuncDeclar('$tid',    (_ctx_)          => (_ctx_.face ?? _ctx_.piece)?.div?.id ?? null,                                                            "tid");
o_.functions.$tchild = new TsiValFuncDeclar('$tchild', (_ctx_, nom)     => (_ctx_.face ?? _ctx_.piece)?.faceCurr?.children[nom]?._tsi ?? null,                                      "tchild, nom");
o_.functions.$trec  = new TsiValFuncDeclar('$trec',   (_ctx_, ...args) => { (o_._testLog ??= []).push([(_ctx_.face ?? _ctx_.piece)?.div?.id ?? '?', ...args]); },                   "trec, ...args");

/**
 * Stoppe le plateau de la pièce, avec aimantation sur la key la plus
 * proche (Tsi_.keyOffsetAccepted). N'affecte pas les autres plateaux.
 */

// Les quatre actions de PLATEAU visent le RÉCEPTEUR d'un `->` quand il y en a un — fcJs fait
// `fn.call(this, ctx, …)`, `this` est la cible (PD 25/08) —, sinon _ctx_.piece : l'appelant
// nu (fcJs est invoqué SUR _ctx_.piece) ou le déclarant d'une key (run : `this` n'est pas une
// Pièce). Jamais le porteur : l'horloge et le plateau vivent sur la Pièce. Écrites pour
// l'ancien `fc` (récepteur = _ctx_), elles lisaient _ctx_.piece seul : au bout d'un `->`,
// elles frappaient l'APPELANT — mesuré le 22/09, corrigé le 26/09 (journal, étape R).
const plateauVise = (self, _ctx_) => (self && self.isPiece) ? self : _ctx_.piece;

//  Une frame, ou une BALISE : un nom se résout dans la piste &mark de la Pièce VISÉE
//  (&mark est de Pièce, PD 17/09). Balise absente = erreur, jamais un silence. (étape S)
const frameDe = (p, x) => {
  if (typeof x !== 'string') return x;
  const marks = p.timeline?.getTrack('mark');
  const k = marks?.keys.find(k => (k.value?.get?.() ?? k.value) === x);
  if (!k) TsiError.error(`balise « ${x} » introuvable dans la piste &mark de #${p.div?.id ?? '?'}`);
  return k.numFrame;
};

o_.functions.$stop = new TsiValFuncDeclar('$stop', function (_ctx_) {
    const p = plateauVise(this, _ctx_);
    if (!p || !p.stopGroup || !p.ptClock) return false;
    p.stopGroup();
    return true;
  }, "$stop");

/**
 * Relance le plateau de la pièce à la position courante.
 * Plateau stoppé → reprend à la frame du stop (frameStop, via getFrameNum) ;
 * les transitions en cours reprennent leur courbe au bon point (délai négatif).
 * Plateau en lecture → resynchronise simplement sur la frame courante.
 */
o_.functions.$restart = new TsiValFuncDeclar('$restart', function (_ctx_) {
    const p = plateauVise(this, _ctx_);
    if (!p || !p.stopGroup || !p.ptClock) return false;
    p.gotoPlayGroup(TsiTrackClock.getFrameNum(p.ptClock));
    return true;
  }, "restart");
o_.functions.$play = new TsiValFuncDeclar('$play', function (_ctx_, path) {
    //  path : une Pièce VIVANTE (parseur texte : $play($parent->fx->play)) ou l'ancien path
    //  RÉIFIÉ (.get) — le dual meurt avec l'ancien chemin, à la coupe. Sans path : le
    //  récepteur d'un `->` ($x->$play()), sinon l'appelant (étape R, 26/09).
    const p = path?.get ? path.get(_ctx_) : (path ?? plateauVise(this, _ctx_));
    if (!p || !p.stopGroup || !p.ptClock) return false;
    p.gotoPlayGroup(TsiTrackClock.getFrameNum(p.ptClock));
    return true;
  }, "play, path?");
//  JOUE LA CIBLE, TRANSFORMÉE (PD 2026-08-27) — le VOCABULAIRE D'AUTEUR qui remplace
//  l'ancien playFx du moteur (coupé : la présentation n'a rien à faire en dur).
//  Récepteur (`this`, via fcJs) = LA CIBLE — le terminal du chemin, la Pièce jouée ;
//  pieceOrg = l'ORIGINE dont la position sert de base (le bouton, via $this) ;
//  la Pièce DÉPLACÉE = le parent du terminal (la sœur, conteneur de l'effet).
//      $parent->fx->play->$playTr($this, 0, -26)            position seule
//      $parent->fx->play->$playTr($this, 0, -26, 1, 1, 90)  + échelle et rotation
//  Un argument absent ne fait rien. Base = offsetLeft/Top (la position RENDUE :
//  quand &pos anime par WAAPI, style.left est vide).
o_.functions.$playTr = new TsiValFuncDeclar('$playTr',
  function (_ctx_, pieceOrg, offsetX, offsetY, scaleX, scaleY, rotation) {
    const cible = this;                              // fcJs : le récepteur du chemin
    const soeur = cible.getPieceParent?.();          // la Pièce à poser
    const sd = soeur?.div, od = pieceOrg?.div;
    if (sd && od && offsetX != null) {
      //  LE GESTE MESURÉ (22/08, ex-playFx) : posUnlock ferme les gotos FUTURS de
      //  &pos ; l'animate déjà posé (fill:forwards) RECOUVRE le style — le FLUSHER
      //  révèle la position posée (l'étoile restait en 0,0 sans ça).
      soeur.posUnlock = true;
      sd.style.left = (offsetX + (od.offsetLeft ?? 0)) + 'px';
      sd.style.top  = ((offsetY ?? 0) + (od.offsetTop ?? 0)) + 'px';
      const pos = soeur.timeline?.getTrack('pos');
      if (pos) { pos.css._anim?.cancel(); pos.css._anim = null; }
    }
    //  ⚠ TODO — scaleX/scaleY n'ont AUCUNE piste : `transform` appartient à `&rotat`
    //  seule. Voir le TODO « &scale et la composition des transforms » en tête de
    //  TsiCssRotat (tispiTracksCss.js). En attendant, écriture DOM brute — le défaut
    //  même qui a fait revenir l'étoile en 0,0 sur la position.
    if (sd && (scaleX != null || rotation != null)) {
      const t = [];
      if (scaleX != null)   t.push(`scale(${scaleX}, ${scaleY ?? scaleX})`);
      if (rotation != null) t.push(`rotate(${rotation}deg)`);
      sd.style.transform = t.join(' ');
    }
    //  REMBOBINER puis jouer : un effet FINI est figé sur sa dernière frame — le
    //  stop d'abord ramène à 0, le play repart PILE de ce stop → il le franchit.
    cible.gotoStopGroup(0);
    cible.gotoPlayGroup(0);
    return true;
  },
  "playTr(pieceOrg, offsetX?, offsetY?, scaleX?, scaleY?, rotation?) — pose la sœur relative à l'origine, puis joue la cible");

/** Relance le plateau de la pièce à numFrame. */
o_.functions.$gotoPlay = new TsiValFuncDeclar('$gotoPlay', function (_ctx_, numFrame) {
    const p = plateauVise(this, _ctx_);
    if (!p) return false;
    p.gotoPlayGroup(frameDe(p, numFrame));                    // une frame, ou une balise de SA piste &mark
    return true;
  }, "gotoPlay, numFrame | balise");

/** Positionne (stop) le plateau de la pièce à numFrame. */
o_.functions.$gotoStop = new TsiValFuncDeclar('$gotoStop', function (_ctx_, numFrame) {
    const p = plateauVise(this, _ctx_);
    if (!p) return false;
    p.gotoStopGroup(frameDe(p, numFrame));                    // une frame, ou une balise de SA piste &mark
    return true;
  }, "gotoStop, numFrame | balise");

/** Transmet une commande à l'élément pilote de la Face courante : $player->$sendToFace("gotoAndPlayValue", 120, 1, 100/6). */
o_.functions.$sendToFace = new TsiValFuncDeclar('$sendToFace', function (_ctx_, name, ...params) {
    const p = plateauVise(this, _ctx_);
    return p ? p.sendToFace(name, ...params) : false;
  }, "sendToFace, name, ...params");
// ═════════════════════════════════════════════════════════════════════════
//  importGroup — importe une branche (module Face/Group) dans une Pièce, à la
//  volée pendant le run. Le DOM compile ; la branche est SON PROPRE plateau
//  autonome ; on n'insère qu'une key dans la piste face.
//  Le parent n'est PAS touché (il joue / est stoppé comme avant). Seule
//  exception : si son curseur est DÉJÀ dans la zone de la key insérée, on
//  montre la branche-face tout de suite.
//
//  @param {string}   url       fichier HTML décrivant la branche (fragment :
//                              une racine <tsi-f>/<tsi-g>)
//  @param {string}   faceName  id donné à la racine → adressée par cet id
//  @param {TsiPiece} piece     Pièce hôte
//  @param {number}   time      frame de la piste face où la branche apparaît
//  @returns {Element} la racine greffée (handle pour un futur export)
// ═════════════════════════════════════════════════════════════════════════
o_.functions.$importGroup = new TsiValFuncDeclar('$importGroup',
  (_ctx_, url, faceName, numFrame) => {
    if (!_ctx_.piece) return false;                       // la greffe vise le plateau
    _ctx_.piece.importGroup(url, faceName, numFrame)
      .catch(e => alert(`importGroup : ${e.message}`));
    return true;
  }, "importGroup, url, faceName, numFrame");

// ═════════════════════════════════════════════════════════════════════════
//  $cssOf(élément) — le PROXY css d'un élément nommé (PD 07/09, étape 6) :
//  `$cssOf($monde).ry = $val` écrit la variable `css $ry` SUR la div de $monde.
//  @param {TsiNode} element  la Pièce (une variable qui la porte : `$monde = this;`)
//  @returns {Proxy} un couple getter/setter par nom de variable css
// ═════════════════════════════════════════════════════════════════════════
o_.functions.$cssOf = new TsiValFuncDeclar('$cssOf',
  (_ctx_, element) => TsiVarCss.proxyOf(element ?? _ctx_.piece),
  "cssOf, element");


// ═════════════════════════════════════════════════════════════════════════════
//  on(événement, callback, source?) — S'ABONNER À UN ÉVÉNEMENT
// ═════════════════════════════════════════════════════════════════════════════
//  C'est LE LISTENER (la cible) qui va s'inscrire chez la SOURCE : la source ne
//  connaît pas ses abonnés à l'avance, elle diffuse à qui s'est présenté.
//
//      &onTime 0:{ on(dragStart, { … }) };            → au service GLOBAL
//      &onTime 0:{ on(drag, { … }, $this) };          → chez MOI
//      &onTime 0:{ on(drag, { … }, $parent.player) }; → chez une AUTRE Pièce
//
//  SOURCE ABSENTE ⇒ o_.events, le service global : y vivent les événements qui
//  n'appartiennent à aucun nœud en particulier (le DRAG), qu'un observateur veut
//  suivre sans connaître la Pièce saisie — le ctx du sender la lui dira.
//
//  ⚠ CETTE FONCTION IGNORE LE CONTENU DU CALLBACK. Elle le range, rien de plus.
//    Il lui arrive VIVANT (TsiValCallback, encapsulé au build par TsiValFuncOn) :
//    une valeur ordinaire aurait été exécutée à l'abonnement au lieu d'être
//    rappelée. À la diffusion, c'est `listener.send` qui l'exécute par run(ctx).
//
//  LE REPÈRE voyage avec le callback (idUnic de la TsiJs porteuse) : avec
//  le nom de l'événement, il dit si ce `on(…)` est LE MÊME que celui déjà en
//  place — `&onTime 0:` se rejoue à chaque passage sur la frame.
o_.functions.$on = new TsiValFuncDeclar('$on',
  (_ctx_, eventName, callback, source) => {
    const cible = source ?? o_;                       // absente ⇒ le service global
    const dest  = _ctx_.face ?? _ctx_.piece;          // le nœud abonné — convention d'identité
    //  LE REPÈRE se PRÉLÈVE dans le contexte (PD) : le ctx porte la key, la key
    //  porte sa valeur — et cette valeur EST le bloc qui s'exécute. Rien à
    //  transmettre, aucune signature à changer.
    const repere = _ctx_.key?.value?.idUnic ?? null;
    if (!dest || !cible?.events) return false;
    cible.events.add(eventName, dest, callback, repere);
    return true;
  },
  "on($événement, callback, source?) — abonne le porteur ; source absente = global");


// (MODULES : l'ébauche impérative qui vivait ici — vieil expandModule ligne-à-ligne,
//  o_.functions.importModule_, moduleManifest — est SUPPRIMÉE. La machinerie
//  actuelle vit dans tispiModules.js : expansion pure balisée, garde de cycle,
//  greffe déclarative par connectedCallback (data-module + hôte vide), manifeste
//  léger piece._module. L'import en o_.functions rouvrait l'anti-modèle —
//  arbitrage 10 de docs/MODULES.md.)



// ─── Balises de paramètre (marks tracks) — API DIRECTE sur l'élément porteur ──
// Le contenu d'un paramètre de module de type tracks = les pistes tamponnées
// `track.mark`. Forme DIRECTE : l'appel se fait sur l'élément dont la timeline
// porte les pistes (balise posée à la main). La résolution hôte → élément via la
// déclaration de module (data-module) déléguera ici — machinerie module à venir.
/*
o_.functions.getTracksInMark = function (node, name) {
  return node.timeline?.tracks.filter(t => t.mark === name) ?? [];   // ⚠ ANNULÉ (balises <*|nom*>, PD 2026-08-15 — cf. TsiBuilder._atMark)
};
*/
// TODO à reconstruire avec build et non compile : le fragment de pistes est un DSL, pas des objets déjà construits. Le
// putTracksInMark — REMPLACEMENT intégral du contenu de la zone (la zone EST la
// valeur du paramètre). fragment = DSL string de pistes (`&color 0:red; …`),
// compilé par la voie normale ; chaque piste née reçoit le mark de la zone.
// @returns {TsiTrack[]} les pistes remplacées
/*o_.functions.putTracksInMark = function (node, name, fragment) {
  const arrs = TsiCompiler.compileText(fragment);
  // &clock interdit dans une zone : son CONSTRUCTEUR clobbère ptClock (registre
  // d'horloge du plateau) avant même la pose — la config d'horloge n'est pas un
  // contenu de paramètre.
  if (arrs.some(a => a[0] === 'clock'))
    TsiError.error(`putTracksInMark : '&clock' interdit dans une zone de paramètre ('${name}')`);
  const built = arrs.map(arr => {
    const track = new o_.css[arr[0]].track(arr, node);
    track.setMark(name);                       // le fragment appartient à la zone
    return track;
  });
  return o_.functions._swapTracksInMark(node, name, built);
};
*/

// Atome SYMÉTRIQUE auto-projetant : échange les pistes marquées `name` contre
// `newTracks`. Inverse = lui-même avec les anciennes (objets EXACTS, provenance
// comprise) → undo/redo naturels. Bornes de transaction = le geste appelant.
// Doublon du fragment contre une piste restante = erreur (setTrack, jamais silencieux).
// ── putPiecesInPlate — importe des Pièces CONSTRUITES dans le plateau d'un
//    groupe. Le plateau est THÉORIQUE (PD) : accrocher les divs à la même div
//    suffit, il se reconstitue par structure. Ne restent à re-déclarer que ce
//    que le build avait compté ailleurs : les DURÉES (règle A) et l'élection
//    d'horloge, poussées au TEMPO de destination. Phase A (avant le walk de
//    start) : la Pièce __clock__ implicite naîtra à la consommation du tempo
//    (prepareFace crée le parking dès qu'il y a des Pièces). ─────────────────
// ⚠ Sa signature ne respectait PAS le contrat `run(context, params)` : elle prenait
//   (pieces, divGroupDest, beforeNode). Alignée le 2026-08-12 — `_ctx_` en tête comme
//   partout, les trois arguments à la suite. Aucun appelant à corriger : elle n'est
//   citée que par deux commentaires de tispiTrack.js, jamais appelée.
o_.functions.$putPiecesInPlate = new TsiValFuncDeclar('$putPiecesInPlate',
  (_ctx_, pieces, divGroupDest, beforeNode = null) => {
    for (const p of pieces) {
      const div = p?.div ?? p;                      // TsiPiece OU élément
      divGroupDest.insertBefore(div, beforeNode);   // ré-insertion inerte (garde _tsi du cc)
      const piece = div._tsi;
      if (!piece?.timeline) continue;
      for (const track of piece.timeline.tracks) {
        const last = track.keys[track.keys.length - 1];
        const len  = last ? last.numFrame + 1 : 0;  // keys triées : la dernière = le max
        if (len > 0) TsiTrackClock.setPlateDurationTempo(len, piece);
      }
      TsiTrackClock.addPieceToPlate(piece);         // MEMBRANE : élection/FUSION d'une &clock fournie
    }
    return true;
  }, "putPiecesInPlate, pieces[], divGroupDest, beforeNode?");


// ═════════════════════════════════════════════════════════════════════════════
//  ⚠ ALIAS DE TRANSITION — LES ANCIENS NOMS, SANS SIGIL
// ═════════════════════════════════════════════════════════════════════════════
//  Les fonctions système portent désormais leur SIGIL : `$stop`, `$log` — le nom
//  écrit et le nom enregistré sont le même, `exe` cherche ce qu'on lui donne, et
//  aucun strip n'existe nulle part (règle des sigils).
//
//  Mais le corpus écrit encore `stop()` sans sigil, et `TsiValFunc.get` appelle
//  `exe(this.name)` avec le nom TEL QU'ÉCRIT. Sans ces alias, toutes les pages
//  lèveraient « fonction inconnue » au prochain chargement, avant même qu'on ait
//  converti une seule écriture.
//
//  ⚠ À RETIRER quand le corpus sera passé au sigil — c'est une seule boucle.
//    Les deux clés désignent LA MÊME entrée : rien n'est dupliqué, seule la porte
//    d'entrée est double.
for (const nom of Object.keys(o_.functions)) {
  if (nom[0] !== '$' || nom === '_name') continue;
  const sansSigil = nom.slice(1);
  if (!(sansSigil in o_.functions)) o_.functions[sansSigil] = o_.functions[nom];
}




//___________________________________________________________________________________________
//___________________________________________________________________________________________
//___________________________________________________________________________________________
//___________________________________________________________________________________________




// (o_.funcProject.test RETIRÉ 2026-08-15 — les fonctions de TEST vivent dans un
//  fichier du noyau, tispiTest.js, à la charge des testeurs : elles voyagent avec
//  le moteur, rien à embarquer à la sauvegarde.)

//    #########      ####     #########    #########    #########   ####    ####   #########
//    ####    ##    ######    ####        ####         ####    ##   ####    ####   ####    ##
//    ####    ##   ####  ##   ####        ####         ####    ##   ####    ####   ####    ##
//    #########    ########   ####        ####         ####    ##   ####    ####   #########
//    ####    ##   ####  ##   ####        ####         ####    ##   ####    ####   ####    ##
//    ####    ##   ####  ##   #########    #########    #########    ########      ####    ##

// ═════════════════════════════════════════════════════════════════════════════
//  RACCOURCIS CLAVIER — extraits de TsiParserTabPlate.jsOld le 2026-08-13.
//  Les raccourcis appartiennent aux FONCTIONS, pas au décompilateur : ce qu'ils
//  déclenchent changera, le geste non. Ils appellent exportFile / exportPage /
//  copyText (tispiBuild.js) — résolus à la frappe, l'ordre de chargement est libre.
//  ⚠ exportFile et exportPage sont EN TRAVAUX (cf. leurs en-têtes) : le chantier
//    de la sauvegarde est saveDocument (Ctrl+Shift+S).
// ═════════════════════════════════════════════════════════════════════════════

// ── Ctrl+Shift+E → exportFile de la branche sous la souris, copié dans le
//    presse-papier. Cible = l'élément tsi-* le plus proche sous le curseur
//    (remontée parentale, pas de sélecteur). Guardé : absent hors DOM (node).
if (typeof document !== 'undefined') {
  let _tsiHover = null;
  document.addEventListener('mousemove', e => { _tsiHover = e.target; });
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey && e.shiftKey && e.code === 'KeyE')) return;
    e.preventDefault();

    // CIBLE : la PIÈCE SÉLECTIONNÉE + sa face COURANTE seule (l'éditeur est là
    // pour ça). Repli : la branche sous la souris (pages sans éditeur).
    let el = null, onlyFace = null;
    const sel = (typeof TsiEditorSelection !== 'undefined') ? TsiEditorSelection._current : null;
    if (sel) {
      el       = sel.component.div;
      onlyFace = sel.component.getFaceCurr?.() ?? null;
    } else {
      el = _tsiHover;
      while (el && !el._tsi) el = el.parentElement;    // remonte au tsi-* le plus proche
    }
    if (!el) { TsiError.debug('export : aucune sélection ni branche sous la souris.'); return; }

    TsiDecompiler.copyText(TsiDecompiler.exportFile(el, undefined, onlyFace))
      .then(() => TsiError.debug(`export : <${el.localName} id="${el.id}">`
        + (onlyFace ? ` + face courante "${onlyFace.id}"` : '') + ' copié dans le presse-papier.'))
      .catch(err => TsiError.warning('export presse-papier : ' + err.message));
  });

  // ── Ctrl+Shift+D → exportPage : la PAGE ENTIÈRE (toutes les branches racines),
  //    sans survol ni sélection. Pendant du Ctrl+Shift+E (une branche).
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey && e.shiftKey && e.code === 'KeyD')) return;
    e.preventDefault();
    TsiDecompiler.copyText(TsiDecompiler.exportPage())
      .then(() => TsiError.debug('export : page entière copiée dans le presse-papier.'))
      .catch(err => TsiError.warning('export presse-papier : ' + err.message));
  });

  // ── Ctrl+Shift+S → SAUVEGARDE PROJET sur le serveur (save.php) : deux fichiers
  //    <racine>.html + tsi_<racine>.js écrits dans le dossier.
  //    LA SAUVEGARDE EST LA BRANCHE (PD) : c'est le GROUPE RACINE du document
  //    qu'on sauve, et c'est SON id qui nomme les fichiers. Pas de groupe racine
  //    → erreur NOMMÉE : la page doit en recevoir un pour être sauvegardable.
  //    (Ctrl+Shift+S du navigateur est neutralisé.)
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey && e.shiftKey && e.code === 'KeyS')) return;
    e.preventDefault();
    const el = [...document.body.children].find(n => n.localName === 'tsi-g');
    if (!el) {
      TsiError.error('sauvegarde : aucun <tsi-g> racine dans la page — le groupe racine '
                   + 'EST la branche sauvegardée, et son id nomme les fichiers');
      return;
    }
    TsiDecompiler.saveToServer(el)
      .then(r => r.error ? TsiError.warning('save : ' + r.error)
                         : TsiError.debug('save : écrit → ' + r.written.join(', ')))
      .catch(err => TsiError.warning('save serveur : ' + err.message));
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiLang.fr.js  (53 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════
//  TISPI — Fichier de LANGUE (français)
//  --------------------------------------------------------------------
//  POUR TRADUIRE : copier ce fichier en  tispiLang.<xx>.js  (ex. .en.js),
//  traduire UNIQUEMENT les VALEURS de `msg` (laisser les {placeholders}
//  intacts — ils sont substitués à l'exécution et peuvent être réordonnés
//  librement dans la phrase traduite), puis charger ce fichier EN PREMIER
//  dans la page (avant tispiTools/Parser/001).
//
//  `prefix`  préfixe de marque (commun à tous les messages).
//  `msg`     catalogue clé → gabarit. Clé absente → le code affiche [clé].
// ════════════════════════════════════════════════════════════════════
const TsiLang = {
  locale: 'fr',
  prefix: 'Tispi ▸ ',

  msg: {
    // ── Tokenizer (lexical) ───────────────────────────────────────────
    unitUnknown:   'unité CSS "{unit}" non supportée',
    operatorTodo:  'opérateur "{op}" non supporté (à venir)',
    endUnexpected: 'fin de script inattendue',

    // ── Compilation : contraintes de piste ────────────────────────────
    propUnknown:   'piste &{prop} inconnue ; pistes connues : {known}',
    arity:         '&{prop} : {expected} valeur(s) attendue(s), reçu {got}... \n> ou "," attendue',
    frameNegative: '&{prop} : frame négative ({frame})',
    frameOrder:    '&{prop} : frame {frame} ≤ frame précédente ({prev}) — frames croissantes attendues',

    // ── Init / DOM (avertissements) ───────────────────────────────────
    idDuplicate:     'id "{id}" présent {n}× sous le MÊME parent — unique requis seulement dans une fratrie/plateau ; des ids identiques dans des plateaux/groupes différents sont OK.',
    idFormat:        'id "{id}" : un id Tispi est un NOM DE VARIABLE — lettres, chiffres et _ seulement, ne commençant pas par un chiffre. Il sert d\'identifiant dans le DSL (&face 0:{id};, _up({id}), les paths) et nomme les fichiers d\'une sauvegarde.',
    faceMissing:     '&face : face "{id}" introuvable dans la Pièce #{piece} (frame {frame}).',
    facePlateSweep:  'À SURVEILLER — la Face-groupe #{id} porte {n} piste(s) à elle et héberge un plateau de Pièces : ses pistes ne sont PAS balayées avec celles de ses filles (PD 05/10).',
    faceHostsPieces: '<tsi-f> #{face} contient des Pièces (#{child}…) qui ne seront PAS animées : utilise <tsi-g> pour héberger des Pièces.',

    // ── Localisation (suffixe de posError) ─────────────────────────────
    posAt:    '(ligne {line}, col {col})',            // ligne du FICHIER HTML (connue)
    posInSpi: '(data-tsi : ligne {line}, col {col})'  // source HTML illisible → ligne INTERNE au data-tsi (utile si multi-ligne)
  },

  /** Rend le message `key`, en substituant {placeholders} par `params`. */
  t(key, params = {}) {
    const s = TsiLang.msg[key];
    if (s == null) return '[' + key + ']';                          // clé absente → visible, pas de crash
    return s.replace(/\{(\w+)\}/g, (_, k) => params[k] != null ? params[k] : '{' + k + '}');
  },

  /** Avertissement non bloquant, préfixé (console.warn). */
  warn(key, params) { console.warn(TsiLang.prefix + TsiLang.t(key, params)); }
};




// ═══════════════════════════════════════════════════════════════════════════════
// ═══  tispiEditor.js  (1105 lignes)
// ═══════════════════════════════════════════════════════════════════════════════

// tispiEditor.js



// ═══════════════════════════════════════════════════════════════════
//  TsiRegistry  —  suivi des editorTools (générationnel, LIFO)
//  register() : tête libre → tête occupée
//  destroy()  : tête occupée → tête libre  (LIFO symétrique)
//  isAlive()  : vérification générationnelle O(1)
// ═══════════════════════════════════════════════════════════════════
class TsiRegistry extends TsiArrayAccess{

  add(editorTool) {
    if(editorTool.index!=null){
        const uidOld = this.get( editorTool.index, editorTool.uid)?.uid; 
        if(uidOld!=null) {
            // TODO ERROR l'index du registre des editorTool est déjà occupé
            return -1;
        }
    }        
    return editorTool.index = this.addValue(editorTool);   // API TsiArrayAccess : addValue → pos
  }

  suppr(editorTool) {
      const uidOld = this.get( editorTool.index, editorTool.uid)?.uid; 
      if(uidOld==null) {
        // TODO ERROR l'index du registre editorTool est inoccupé ou occupé par un composant différent
        return null;
    }
    const index = editorTool.index;
    editorTool.index = null;
    return this.supprValue(index);                          // API TsiArrayAccess
  }

  /** O(1) — vrai si le slot contient encore le même composant (uid générationnel). */
  isAlive(index, uid) { return this.get(index, uid) != null; }

  /** O(1) — retourne l'editorTool vivant ou null. */
  get(index, uid) {
    const s = this.getAt(index);                            // API TsiArrayAccess
    return s?.uid === uid ? s : null;
  }
}


// ═══════════════════════════════════════════════════════════════════
//  TsiEditorTool  —  interface éditeur attachée à chaque composant
//  (Piece, Elastic, TsiSelectionService, TsiSelectionBridge…)
// ═══════════════════════════════════════════════════════════════════
class TsiEditorTool {
  constructor(component) {
    this.uid       = ++TsiEditor.idCurr;   // numéro unique session
    this.index     = null;                 // case dans le registry (set par register())
    this.component = component;            // référence retour vers le composant
    TsiEditor.registry.add(this);
  }

  destroy() {
    TsiEditor.registry.suppr(this);
  }
}


// ═══════════════════════════════════════════════════════════════════
//  TsiEditorPropFilter  —  permissions d'édition par pièce
//  Reflète les cases à cocher utilisateur dans le panneau éditeur
// ═══════════════════════════════════════════════════════════════════
class TsiEditorPropFilter {
  constructor() {
    this.canEdit   = true;   // sélectionnable
    this.canMove   = true;   // déplaçable
    this.canResize = true;   // redimensionnable
    this.canRotate = true;   // rotationnable
  }
}
//    ##########   ####   ###########   #########    ###########
//    ####    #### ####   ####         ####    ####  ####       
//    ####    #### ####   ####         ####          ####       
//    ##########   ####   ########     ####          ########   
//    ####         ####   ####         ####          ####       
//    ####         ####   ####         ####    ####  ####       
//    ####         ####   ###########   #########    ###########
//   
//   
//   
//   

// ═══════════════════════════════════════════════════════════════════
//  TsiEditorPiece  —  service éditeur d'une TsiPiece
//  Créé dans TsiPiece : this.editor = new TsiEditorPiece(this)
//
//  Responsabilités :
//    — identité dans le registry (uid, index)
//    — permissions d'édition (cases à cocher utilisateur)
//    — comportement souris : sélection, drag, requête élastique
//    — enCommentaire : pièce-macro active en mode édition
//    — Ctrl : désactive temporairement enCommentaire → pièce éditable
//    — navigation sous-groupes
//
//  Connexions directes aux singletons (aucun hub sur la pièce) :
//    TsiEditorSelection      — émission + réception (bidirectionnel)
//    TsiEditorMultiSelection — connexion selon sélection active
//
//  Mode édition global : TsiEditor._editMode (posé par bouton stop/play)
// ═══════════════════════════════════════════════════════════════════
class TsiEditorPiece extends TsiEditorTool {
  constructor(piece) {
    super(piece);

    // ── Permissions (cases à cocher utilisateur) ──────────────────
    // null = comportement par défaut :
    //   true  si la pièce est dans le groupe en cours d'édition
    //   false si la pièce est dans un sous-groupe
    // TsiEditorPropFilter créé uniquement si l'utilisateur définit des permissions explicites
    this.filter = null;

  }

  // ── Sélection ─────────────────────────────────────────────────
  select() {
    TsiEditorSelection.select(this);
  }

  // ── Elastic ───────────────────────────────────────────────────
  requestElastic() {
    TsiEditorSelection.showElastic(this);
  }

  // ── Sous-groupes ──────────────────────────────────────────────
  // Déclenchée par la pièce-groupe elle-même, réactive à la souris.
  // Configure quelles pièces enfants sont sélectionnables.
  prepareSelectables(subGroup) {
    // TODO : implémentation selon architecture TsiGroupIndex
  }

  // Comportement souris : AUCUN handler ici — la sélection est DÉLÉGUÉE
  // (listener document unique, au MOUSEDOWN : sélection + drag = un même geste).
  // Le drag reviendra par l'élastique/multi-sélection, pas par la pièce.
}
/*
─── Usage ──────────────────────────────────────────────────────────────────────

// Abonnement d'un contrôle au hub de sélection
selectionService.hubs.onSetLocation.add(controlEditorTool, ({ x, y }) => {
    inputX.value = x;
    inputY.value = y;
});

// Abonnement de l'elastic-selected
selectionService.hubs.onSetLocation.add(elasticEditorTool, ({ x, y, sender }) => {
    elastic.updateHandles(x, y);
});

// Émission depuis la pièce
piece.editorTool.onSetLocation.dispatch({ x: 120, y: 48, sender: piece }, TsiEditor.registry);

// Cascade : fermeture d'onglet
TsiEditor.hubs.onGroupIndexChanged.dispatch({ index: 2, closed: true }, TsiEditor.registry);
// → handler concerné déclenche onPieceSelected(null)
*/



/**
## TsiEditorPiece — Compte rendu complet

---

### Définition

```javascript
class TsiEditorPiece extends TsiEditorTool { }
// Dans TsiPiece :
this.editor = new TsiEditorPiece(this);
```

Hérite de `TsiEditorTool` : `uid`, `index`, `component`.
S'enregistre automatiquement dans `TsiEditor.registry`.
Nommé `TsiEditorXXX` — la convention `TsiPieceXXX` est réservée aux héritiers de `TsiPiece`.

---

### 1 — Identité dans le registry

`uid` et `index` servent de carte d'identité lors des abonnements aux hubs-events des singletons `TsiEditorSelection` et `TsiEditorMultiSelection`.

---

### 2 — Mode édition

`activate()` pose `TsiEditor._editMode = true` et écrase directement les handlers du div.
`deactivate()` pose `TsiEditor._editMode = false` et restitue la piste `onMouse`.

En mode édition :
- `play()` est bloqué — la pièce reste en `gotoStop()` permanent
- `gotoStop()` applique les pistes CSS normalement
- Les actions (`onTimer`) sont **inhibées**
- L'éditeur prend la main via `editor.onGotoStop(frame)`

---

### 3 — Filtres de permissions

Liste cochée par l'utilisateur :

```javascript
this.canEdit   = true;   // sélectionnable
this.canMove   = true;   // déplaçable
this.canResize = true;   // redimensionnable
this.canRotate = true;   // rotationnable
```

Chaque handler vérifie son filtre avant d'agir.

---

### 4 — Comportement souris éditeur

```javascript
_onMouseDown(e) → sélection + mémorisation de e.ctrlKey
_onDrag({ state, dx, dy }) → drag, déplacement, requête élastique
```

Connexion directe aux singletons — pas de hubs sur la pièce :

```javascript
// Émission
TsiEditorSelection.hubs.onSetLocation.dispatch({ dx, dy }, TsiEditor.registry);
// Réception (abonnement à l'activation)
TsiEditorSelection.hubs.onSetLocation.add(this, ({ x, y }) => piece.setLocation(x, y));
```

---

### 5 — Sous-groupes

`prepareSelectables(subGroup)` configure quelles pièces du sous-groupe sont accessibles à la sélection selon la profondeur de navigation.

---

### 6 — enCommentaire (pièce-macro)

```javascript
this.enCommentaire = false;
```

Quand `true` : la pièce reste **active** en mode édition — ses actions s'exécutent, elle participe directement à l'acte d'édition comme outil vivant (guides, mesures, contrôles, aide contextuelle…).

**Touche Ctrl** : désactive temporairement `enCommentaire` → la pièce-macro devient éditable normalement. L'état Ctrl est mémorisé au `mousedown` (`_ctrlActive`) car le drag ne reçoit pas l'événement DOM original.

---

### Tableau des modes

| Mode | Actions | Mouse | play() |
|------|---------|-------|--------|
| Normal | actives | piste onMouse | actif |
| Édition | inhibées | editor direct | bloqué |
| Édition + `enCommentaire` | **actives** | editor direct | bloqué |
| Édition + `enCommentaire` + Ctrl | inhibées | editor direct | bloqué |

---

### Connexions

| Service | Rôle |
|---------|------|
| `TsiEditor.registry` | enregistrement uid/index |
| `TsiEditorSelection` | émetteur + récepteur (bidirectionnel) |
| `TsiEditorMultiSelection` | connexion selon sélection active |


_____________________________________________________________________________________
________________________________________________

##Piece.editor : accès aux hubs-event d'editorSelection et editorMultiSlection


Accès direct aux singletons — schéma clair :

```javascript
// La pièce émet (son état a changé)
TsiEditorSelection.hubs.onSetLocation.dispatch({ x, y, sender: piece }, TsiEditor.registry);

// La pièce reçoit (un contrôle a changé la valeur)
TsiEditorSelection.hubs.onSetLocation.add(piece.editor, ({ x, y }) => {
  piece.setLocation(x, y);
});
```

`piece.editor` (`TsiEditorPiece`) sert uniquement d'**identité** pour `add()` / `remove()` — uid + index pour le registry, rien de plus.

---

**Architecture finale :**

```
Pièce ──emit──▶  TsiEditorSelection.hubs.onXxx  ◀──emit── Contrôles
     ◀──recv──                                     ──recv──▶
```

- Un seul `TsiEditorSelection` — la pièce sélectionnée s'y connecte
- Un seul `TsiEditorMultiSelection` — les pièces de la multi-sélection s'y connectent
- La pièce accède directement aux deux singletons, pas d'intermédiaire

`TsiEditorPiece` = carte d'identité éditeur de la pièce. Rien d'autre.

---

Donc `TsiEditorPiece` reste **nu** — identité seule :

```javascript
class TsiEditorPiece extends TsiEditorTool {
  constructor(piece) {
    super(piece);
    TsiEditor.registry.register(this);
  }

  destroy() {
    TsiEditor.registry.destroy();
  }
}
```

---

**Répartition corrigée :**

| Classe | Hubs |
|--------|--------|
| `TsiEditorTool` | aucune |
| `TsiEditorPiece` | aucune — juste uid + index |
| `TsiEditorSelection` | hubs pièce ↔ contrôles |
| `TsiEditorMultiSelection` | hubs agrégation |
| `TsiEditor.hubs` | hubs globales |

---

Question qui s'ensuit : comment les événements de la pièce (déplacement, resize…) atteignent-ils `TsiEditorSelection` ou `TsiEditorMultiSelection` sans hubs sur la pièce ?


________________________________________________


## Piece.editor - introduction

class TsiEditorPiece extends TsiEditorTool {
  constructor(piece) {
    super(piece);
    TsiEditor.registry.register(this);
  }

  // ── Sélection ──────────────────────────────
  select() {
    TsiEditorSelection.select(this);
  }

  // ── Elastic ────────────────────────────────
  requestElastic() {
    TsiEditorSelection.showElastic(this);
  }

  // ── Handler onMouse en mode édition ────────
  get mouseHandler() {
    return {
      mousedown: e  => this._onMouseDown(e),
      drag:      ev => this._onDrag(ev)
    };
  }

  _onMouseDown(e) {
    this.select();
  }

  _onDrag({ state, dx, dy }) {
    if (state === TsiDragDiv.ON_DRAG_START) this.requestElastic();
    if (state === TsiDragDiv.ON_DRAG)
      TsiEditorSelection.hubs.onSetLocation.dispatch({ dx, dy }, TsiEditor.registry);
    if (state === TsiDragDiv.ON_DRAG_END)
      /* finaliser * / ;
  }
}

________________________________________________



##Filtres

1. Filtre de permissions (liste cochée par l'utilisateur)

class TsiEditorPiece extends TsiEditorTool {
  constructor(piece) {
    super(piece);
    TsiEditor.registry.register(this);

    // Permissions d'édition
    this.canEdit   = true;   // sélectionnable
    this.canMove   = true;   // déplaçable
    this.canResize = true;   // redimensionnable
    this.canRotate = true;   // rotationnable
    // ...
  }

  _onMouseDown(e) {
    if (!this.canEdit) return;
    this.select();
  }

  _onDrag({ state, dx, dy }) {
    if (!this.canMove) return;
    // ...
  }
}

2. Pièces sélectionnables dans les sous-groupes

Un groupe contient des pièces. piece.editor détermine lesquelles sont accessibles à la sélection en fonction de la profondeur de navigation dans les sous-groupes.


// Prépare les cibles sélectionnables du sous-groupe courant
prepareSelectables(subGroup) {
  subGroup.pieces.forEach(p => {
    p.editor.canEdit = this._filterList.isSelectable(p);
  });
}

________________________________________________
## **inhibition de mode** — quand `piece.editor` est actif, trois mécanismes sont gelés.

---

**Un flag sur la pièce suffit :**

```javascript
class TsiEditorPiece extends TsiEditorTool {

  activate() {
    TsiEditor._editMode = true;
    // Poser directement les handlers éditeur sur le div
    const div = this.component.div;
    div.onmousedown = e  => this._onMouseDown(e);
    div.onDrag      = ev => this._onDrag(ev);
  }

  deactivate() {
    TsiEditor._editMode = false;
    // Restituer la piste onMouse
    this.component.css.onMouse.refresh();
  }
}
```

---

**Les trois inhibitions :**

**`onMouse`** — `activate()` écrase directement `div.onXxx`. La piste ne reprend la main qu'au `deactivate()`.

**`onTimer`** — le handler vérifie le flag :
```javascript
// dans le moteur onTimer
if (TsiEditor._editMode) return;
```

**`play()`** — même vérification :
```javascript
play() {
  if (TsiEditor._editMode) return;
  // avance normale
}
```

---

**Résumé :**

| Mécanisme | Normal | Édition |
|-----------|--------|---------|
| `onMouse` | piste active | éditeur direct |
| `onTimer` | exécuté | ignoré |
| `play()` | avance | bloqué |

`_editMode` est global pour l'éditeur — la pièce n'a pas à connaître les détails.

##Traitement en édition
gotoStop(frame) {
  // CSS tracks → toujours normaux
  // ...

  // Actions → actives si enCommentaire, sinon inhibées
  if (!TsiEditor._editMode || this.editor.enCommentaire)
    this.action.onTimer.gotoStop(frame);

  if (TsiEditor._editMode)
    this.editor.onGotoStop(frame);
}

gotoStop(frame)
  ├── Pistes CSS    → appliquées normalement  (visuel correct à ce frame)
  ├── Pistes action → inhibées                (onTimer, callbacks muets)
  └── → donne la main à piece.editor
            ├── gère la position (drag, elastic)
            ├── gère la sélection
            └── gère les mouse handlers
________________________________________________

##Implémentation de "enCommentaire"
_onMouseDown(e) {
  this._ctrlActive = e.ctrlKey;                          // mémorisé pour le drag

  if (this.enCommentaire && !this._ctrlActive) return;   // laisse la macro agir
  if (!this.canEdit) return;

  this.select();
}

_onDrag({ state, dx, dy }) {
  if (this.enCommentaire && !this._ctrlActive) return;   // même garde
  if (!this.canMove) return;
  // drag normal...
}
 */

//     ####    ####   ####    ####   #########            ###########  ####    ####  ###########  ####     ####  ########### 
//     ####    ####   ####    ####   ####    ####         ####         ####    ####  ####         ######   ####     ####    
//     ####    ####   ####    ####   ####    ####         ####          ####  ####   ####         #######  ####     ####    
//     ############   ####    ####   ##########           ########      ####  ####   ########     #### ### ####     ####    
//     ####    ####   ####    ####   ####    ####         ####           ########    ####         ####  #######     ####    
//     ####    ####    ####  #####   ####    ####         ####            ######     ####         ####   ######     ####    
//     ####    ####     ##########   #########            ###########      ####      ###########  ####     ####     ####    
//     
// 


// ═══════════════════════════════════════════════════════════════════
//  TsiListenerHub  —  un hub = un type d'événement
//  — anti-doublon par uid
//  — auto-nettoyage des composants disparus au dispatch
//  — O(1) add / remove / dispatch par listener
// ═══════════════════════════════════════════════════════════════════
class TsiListenerHub {
  /**
   * @param {object}  [opts]
   * @param {boolean} [opts.multiSelect=false]
   *   true → propagé aux pièces de la multi-sélection si touche Maj
   */
  constructor({ multiSelect = false } = {}) {
    this.multiSelect = multiSelect;
    this._store  = new TsiArrayAccess(8);  // slot → { handler, uid, index }
    this._byUid  = new Map();              // uid  → slot  (anti-doublon + remove O(1))
  }

  /** Abonne editorTool. Sans effet si déjà abonné. */
  add(editorTool, handler) {
    if (this._byUid.has(editorTool.uid)) return;
    const slot = this._store.addValue({ handler, uid: editorTool.uid, index: editorTool.index });
    this._byUid.set(editorTool.uid, slot);
  }

  /** Désabonne editorTool. Sans effet s'il n'est pas abonné. */
  remove(editorTool) {
    const slot = this._byUid.get(editorTool.uid);
    if (slot === undefined) return;
    this._byUid.delete(editorTool.uid);
    this._store.supprValue(slot);
  }

  /**
   * Dispatche à tous les listeners vivants.
   * Nettoie automatiquement les listeners orphelins.
   * @param {object}      detail
   * @param {TsiRegistry} registry
   */
  dispatch(detail, registry) {
    if (this._store._ptOcc === -1) return;

    // Snapshot avant dispatch : un handler peut appeler remove()
    const slots = [];
    let i = this._store._ptOcc;
    do { slots.push(i); i = this._store._tabFree[i]; } while (i !== this._store._ptOcc);

    for (const slot of slots) {
      const e = this._store.getAt(slot);
      if (!e) continue;   // déjà retiré dans ce dispatch
      if (!registry.isAlive(e.index, e.uid)) {
        // Composant disparu → nettoyage automatique
        this._byUid.delete(e.uid);
        this._store.supprValue(slot);
      } else {
        e.handler(detail);
      }
    }
  }
}


// ═══════════════════════════════════════════════════════════════════
//  TsiEditorHubs  —  hubs globales de l'éditeur
//  Événements non liés à une pièce spécifique
// ═══════════════════════════════════════════════════════════════════
class TsiEditorHubs {
  constructor() {
    this.onPieceSelected     = new TsiListenerHub(); // pièce sélectionnée change { piece | null }
    this.onGroupIndexChanged = new TsiListenerHub(); // onglet groupe change / fermé
    this.onEditFace          = new TsiListenerHub(); // mode édition face activé
    this.onFaceSelected      = new TsiListenerHub(); // face sélectionnée change { faceEl, face } — étage SÉPARÉ de la pièce (le temps swappe la face, la Pièce demeure)
    this.onFrameChanged      = new TsiListenerHub(); // temps d'édition { frame, sender } — barre de temps ↔ service TEMPS du groupe ACTIF
  }
}


// ═══════════════════════════════════════════════════════════════════
//  TsiSelectionHubs  —  hubs du service de sélection
//  Bidirectionnel : pièce sélectionnée ↔ contrôles éditeur
// ═══════════════════════════════════════════════════════════════════
class TsiSelectionHubs {
  constructor() {
    // multiSelect:true  → propagé aux pièces Maj si touche Maj enfoncée
    // multiSelect:false → concerne uniquement la pièce sélectionnée
    this.onSetLocation     = new TsiListenerHub({ multiSelect: true  });
    this.onResize          = new TsiListenerHub({ multiSelect: true  });
    this.onRotation        = new TsiListenerHub({ multiSelect: true  });
    this.onFaceChanged     = new TsiListenerHub({ multiSelect: false });
    this.onZOrderChanged   = new TsiListenerHub({ multiSelect: false });
    this.onPropertyChanged = new TsiListenerHub({ multiSelect: false });
    // (onFrameChanged retiré : le TEMPS est un concern de GROUPE — service temps
    //  de TsiEditorGroup via TsiEditor.hubs.onFrameChanged, pas de la sélection)
  }
}


// ═══════════════════════════════════════════════════════════════════
//  TsiMultiSelectionHubs  —  hubs du service multi-sélection
//  Unidirectionnel : piece[i].editorTool → agrégation → contrôles spéc.
// ═══════════════════════════════════════════════════════════════════
class TsiMultiSelectionHubs {
  constructor() {
    this.onSetLocation     = new TsiListenerHub();
    this.onResize          = new TsiListenerHub();
    this.onRotation        = new TsiListenerHub();
    this.onFaceChanged     = new TsiListenerHub();
    this.onZOrderChanged   = new TsiListenerHub();
    this.onPropertyChanged = new TsiListenerHub();
    this.onFrameChanged    = new TsiListenerHub();
  }
}


//     #####   ######    ##       ######     #####  ########### ####    ####   #####   ####  ####
//    #######  #######   ##       #######   ##   ## ####        ####    ####  ##   ##  ####  ####
//   ###   ### ##   ###  ##       ##   ###  ##      ####        ####    #### ###   ### ####  ####
//   ##     ## ##    ##  ##       ##    ##  ##      ########    ####    #### ##     ## ####  ####
//   ######### ##    ##  ##       ##    ##  ##      ####        ####    #### ######### ####  ####
//   ###   ### ##   ###  ##       ##   ###  ##   ## ####         ####  ####  ###   ### ####  ####
//    #######  #######   ######   #######    #####  ###########   ########    #######  ##########
//     #####   ######    ######   ######      ###   ###########    ######      #####    ########


// ═══════════════════════════════════════════════════════════════════
//  TsiEditorSelection  —  singleton de sélection
//  Une seule pièce active à la fois.
//
//  select(editorPiece) — change la sélection
//    ① déconnecte la pièce précédente des hubs
//    ② connecte la nouvelle pièce (_connect)
//    ③ notifie TsiEditor.hubs.onPieceSelected
//
//  showElastic(editorPiece) — délègue à TsiGroupElastique (futur)
//
//  _connect / _disconnect — abonnement bidirectionnel de la pièce :
//    Pièce ──emit──▶  hub.onSetLocation  ◀──emit── Contrôles
//         ◀──recv──                        ──recv──▶
//
//  sender — filtre anti-écho :
//    La pièce dispatch({ dx, dy, sender: this })
//    Son propre handler vérifie (sender === editorPiece) → return
//    Les contrôles dispatch sans sender → la pièce reçoit et bouge
//
//  Hubs (TsiSelectionHubs) :
//    onSetLocation     multiSelect — déplacement  { dx, dy, sender? } | { x, y, sender? }
//    onResize          multiSelect — dimensions    { w, h, sender? }
//    onRotation        multiSelect — angle         { angle, sender? }
//    onFaceChanged               — face active    { face }
//    onZOrderChanged             — z-order        { delta }
//    onPropertyChanged           — propriétés CSS { ...props }
//    onFrameChanged              — frame          { frame }
// ═══════════════════════════════════════════════════════════════════
class TsiEditorSelection {
  static _current = null;   // TsiEditorPiece | null
  static _elastic = null;   // TsiGroupElastique (futur)
  static hubs     = new TsiSelectionHubs();

  // ── API publique ──────────────────────────────────────────────────

  /**
   * Sélectionne une pièce (remplace la sélection courante).
   * Appeler avec null pour déselectionner.
   * @param {TsiEditorPiece|null} editorPiece
   */
  // ── SÉLECTION DOUBLE : Pièce ET Face, SÉPARÉES (wvAnim : changerObjet / changerComposant).
  //    La face peut CHANGER (temps) pendant que la Pièce reste sélectionnée —
  //    et chacune aura sa cible d'édition (barre / cadre de paramétrage).
  static _faceEl = null;      // Element de la FACE sélectionnée (porte le liseré : l'espace est à elle, pas à la Pièce)

  static select(editorPiece) {
    if (this._current === editorPiece) return;
    const prev = this._current;
    if (prev !== null) this._disconnect(prev);
    this._current = editorPiece;
    if (editorPiece !== null) this._connect(editorPiece);

    // la sélection de FACE SUIT : face courante de la pièce (null si désélection)
    this.selectFace(editorPiece
      ? (editorPiece.component.getFaceCurr?.() ?? editorPiece.component.div)
      : null);

    // La sélection modifie beaucoup de choses (décision PD, héritée de wvAnim) :
    // elle se CONSIGNE dans l'undo — inverse = re-sélectionner la précédente.
    if (typeof TsiUndo !== 'undefined')
      TsiUndo.record(() => TsiEditorSelection.select(prev));
    TsiEditor.hubs.onPieceSelected.dispatch({ editorPiece }, TsiEditor.registry);
  }

  /** Sélection de FACE — étage séparé. PAS de record undo : DÉRIVÉE de
   *  (pièce sélectionnée, temps). Visuel : le liseré vit ici. */
  static selectFace(faceEl) {
    if (this._faceEl === faceEl) return;
    this._faceEl?.classList.remove('tsi-selected');
    this._faceEl = faceEl;
    faceEl?.classList.add('tsi-selected');
    TsiEditor.hubs.onFaceSelected.dispatch({ faceEl, face: faceEl?._tsiFace ?? null }, TsiEditor.registry);
  }

  /** Au changement de TEMPS : la pièce sélectionnée a peut-être swappé de face. */
  static refreshFace() {
    if (this._current)
      this.selectFace(this._current.component.getFaceCurr?.() ?? this._current.component.div);
  }

  /** Raccourci : enlève toute sélection. */
  static deselect() { this.select(null); }

  /**
   * Affiche l'élastique de sélection (poignées).
   * Déclenché au ON_DRAG_START depuis TsiEditorPiece._onDrag().
   * @param {TsiEditorPiece} editorPiece
   */
  static showElastic(editorPiece) {
    // TODO : TsiGroupElastique.attachTo(editorPiece.component)
  }

  // ── Connexion / déconnexion ────────────────────────────────────

  /**
   * Abonne la pièce à tous les hubs.
   * Elle recevra les commandes émises par les contrôles (panneau éditeur).
   * Filtre sender : ignore les dispatches émis par la pièce elle-même.
   */
  static _connect(editorPiece) {
    const piece = editorPiece.component;

    // multiSelect — filtre sender (écho drag)
    this.hubs.onSetLocation.add(editorPiece, ({ dx, dy, x, y, sender }) => {
      if (sender === editorPiece) return;
      piece.setCss('location', dx !== undefined ? { dx, dy } : { x, y });
    });
    this.hubs.onResize.add(editorPiece, ({ w, h, sender }) => {
      if (sender === editorPiece) return;
      piece.setCss('transform', { w, h });
    });
    this.hubs.onRotation.add(editorPiece, ({ angle, sender }) => {
      if (sender === editorPiece) return;
      piece.setCss('transform', { angle });
    });

    // sens unique contrôle → pièce
    this.hubs.onFaceChanged.add(editorPiece,     ({ face })          => piece.setCss('face',   face));
    this.hubs.onZOrderChanged.add(editorPiece,   ({ delta })         => piece.setCss('zorder', delta));
    this.hubs.onPropertyChanged.add(editorPiece, ({ family, value }) => piece.setCss(family,   value));
  }

  /** Désabonne la pièce de tous les hubs. */
  static _disconnect(editorPiece) {
    this.hubs.onSetLocation.remove(editorPiece);
    this.hubs.onResize.remove(editorPiece);
    this.hubs.onRotation.remove(editorPiece);
    this.hubs.onFaceChanged.remove(editorPiece);
    this.hubs.onZOrderChanged.remove(editorPiece);
    this.hubs.onPropertyChanged.remove(editorPiece);
  }
}


// ═══════════════════════════════════════════════════════════════════
//  TsiEditorGroup  —  service éditeur d'un TsiGroup
//  Créé par TsiGroupEdited.setGroup() : group.editor = new TsiEditorGroup(group)
// ═══════════════════════════════════════════════════════════════════
// RÔLE : conserver l'ÉTAT du groupe lorsqu'il n'est pas en cours d'édition
// (sélection, temps d'édition…) — et l'appliquer quand il l'est.
class TsiEditorGroup extends TsiEditorTool {
  constructor(group) {
    super(group);
    this.pieceSelected = null;   // mémoire de sélection PAR groupe (navigation onglets/sous-groupes)

    // ── Service TEMPS ─────────────────────────────────────────────
    // Mémorise le temps d'édition courant du groupe et PROJETTE le plateau
    // (gotoStopGroup) au changement — édition = STOP, projection statique.
    // N'écoute que si le groupe est ACTIF (maître du tableau de bord).
    this.editFrame = 0;
    TsiEditor.hubs.onFrameChanged.add(this, ({ frame, sender }) => {
      if (sender === this || !this.isActive) return;
      this.setEditFrame(frame);
    });
  }

  setEditFrame(frame) {
    if (frame === this.editFrame) return;
    this.editFrame = frame;
    const clock = this.component.onePiece?.()?.ptClock;
    clock?.gotoStopGroup(frame);
    TsiEditorSelection.refreshFace();   // le temps a pu swapper la face de la pièce sélectionnée
  }

  // UNE SEULE VÉRITÉ : les singletons. isEdited/isActive sont DÉRIVÉS, jamais stockés
  // (l'invariant « un seul groupe édité » est structurel, pas discipliné).
  get isEdited() { return TsiGroupEdited._current === this.component; }

  // actif = maître du tableau de bord ; par défaut le groupe édité.
  // (sélection-interne : TsiEditor._activeGroup prendra le relais — à venir)
  get isActive() { return (TsiEditor._activeGroup ?? TsiGroupEdited._current) === this.component; }
}


// ═══════════════════════════════════════════════════════════════════
//  TsiGroupEdited  —  singleton du groupe en cours d'édition
// ═══════════════════════════════════════════════════════════════════
class TsiGroupEdited {
  static _current = null;                                    // TsiGroup en cours d'édition
  static hubs     = { onGroupChanged: new TsiListenerHub() }; // hub : changement de groupe édité

  // Délégation : rien à câbler/nettoyer sur les pièces — le listener de
  // TsiEditor lit `_current` au moment du clic.
  static setGroup(group) {
    if (this._current === group) return;
    this._current = group;
    if (!group.editor) group.editor = new TsiEditorGroup(group);
    this.hubs.onGroupChanged.dispatch({ group }, TsiEditor.registry);
  }
}

// ═══════════════════════════════════════════════════════════════════
//  TISPI EDITOR — Services d'édition : registry, bornes-event, outils
// ═══════════════════════════════════════════════════════════════════
//
//      ###########  ########      ####  ##########   ########     ############  
//      ####         ####  ####    ####     ####     ####  ####    ####     ####
//      ####         ####    ####  ####     ####    ####    ####   ####     ####
//      ########     ####    ####  ####     ####    ####    ####   ############ 
//      ####         ####    ####  ####     ####    ####    ####   ####   ####  
//      ####         ####  ####    ####     ####     ####  ####    ####    #### 
//      ###########  ########      ####     ####      ########     ####     ####
//
//
// 
// ═══════════════════════════════════════════════════════════════════
//  TsiEditor  —  service global de l'éditeur
// ═══════════════════════════════════════════════════════════════════
class TsiEditor {
  static _editMode    = false;               // false = runtime / true = édition
  static idCurr       = 0;
  static registry     = new TsiRegistry();
  static hubs         = new TsiEditorHubs(); // hubs globales éditeur
  static _zone        = null;                // élément d'ancrage (point de montage, ex. tsi-g #center)
  static _activeGroup = null;                // maître du tableau de bord (null → = groupe édité)

  /**
   * Point d'entrée éditeur — à appeler après o_.start().
   * @param {HTMLElement} zone — élément PERSISTANT du point de montage (ex. le
   *   tsi-g #center du layout). PAS la branche montée : elle peut être remplacée.
   */
  static _editStack   = [];                  // pile des niveaux d'édition de groupe : { faceEl, parent, next, left, top }
  static _stage       = null;                // couche de travail (Portal) — simple div d'ÉDITEUR, pas une Pièce

  static start(zone) {
    if (this._editMode) return;
    this._editMode = true;
    this._zone     = zone;

    // 1 — GEL : l'édition ne vit qu'en mode STOP (invariant de sûreté).
    //     Le plateau de la zone est figé à sa frame courante.
    const groupFace = zone._tsi;                        // la face-groupe (tsi-g)
    const clock = groupFace.onePiece?.()?.ptClock;
    clock?.gotoStopGroup(TsiTrackClock.getFrameNum(clock));

    // 2 — Groupe édité initial = la zone. UNE seule vérité : TsiGroupEdited.
    TsiGroupEdited.setGroup(groupFace);

    // 3 — LES listeners délégués, uniques pour toute la session d'édition.
    //     MOUSEDOWN (sélection + drag = un même geste) ; DBLCLICK (éditer la
    //     face-en-cours — « réaction » du groupe = descente). Phase capture,
    //     ANCRÉS sur la zone : plafond structurel (currentTarget).
    zone.addEventListener('mousedown', TsiEditor._onMouseDown, true);
    zone.addEventListener('dblclick',  TsiEditor._onDblClick,  true);
    document.addEventListener('keydown', TsiEditor._onKeyDown, true);   // gestes clavier éditeur (Ctrl+Shift+V…)

    // 4 — Couche de travail (Portal) : div d'éditeur PLAT, dernier enfant de la
    //     zone → rend AU-DESSUS du montage estompé. pointer-events:none (vide,
    //     ne bloque pas la remontée) ; ses enfants (le groupe édité) en auto.
    this._stage = document.createElement('div');
    this._stage.id = 'tsiStage';
    zone.appendChild(this._stage);

    // 5 — CSS éditeur (une fois par page)
    if (!document.getElementById('tsiEditorCss'))
      document.head.insertAdjacentHTML('beforeend',
        '<style id="tsiEditorCss">' +
        '.tsi-selected{outline:2px solid #00c8ff;outline-offset:1px;}' +
        '.tsi-dimmed{filter:grayscale(.6) opacity(.45);}' +       /* filter, JAMAIS opacity (collision &opacity) */
        '#tsiStage{position:absolute;inset:0;pointer-events:none;}' +
        '#tsiStage>*{pointer-events:auto;}' +
        '</style>');
  }

  /** Sortie du mode édition — miroir de start. (Reprise du run : à trancher.) */
  static stop() {
    if (!this._editMode) return;
    while (this._editStack.length) this.leaveGroup();   // remonter proprement tous les niveaux
    this._editMode = false;
    TsiEditorSelection.deselect();
    this._zone?.removeEventListener('mousedown', TsiEditor._onMouseDown, true);
    this._zone?.removeEventListener('dblclick',  TsiEditor._onDblClick,  true);
    document.removeEventListener('keydown', TsiEditor._onKeyDown, true);
    this._stage?.remove();
    this._stage = null;
    this._zone = null;
    this._activeGroup = null;
  }

  // ── Résolution du mousedown (délégation) ────────────────────────────
  //  Remonte de e.target (le plus profond) vers la zone ; sélectionne la Pièce
  //  ENFANT DIRECT du groupe édité qui contient le clic — sélection
  //  INCONDITIONNELLE dans le groupe édité. DANS le groupe édité, fond → désélection ;
  //  HORS du groupe édité (contexte estompé) → REMONTÉE d'un cran.
  //  À VENIR : sélection-interne (sous-groupes, permissions), pièce-commentaire (Ctrl).
  static _onMouseDown(e) {
    const editedDiv = TsiGroupEdited._current?.div;
    if (!editedDiv) return;

    if (typeof TsiUndo !== 'undefined') TsiUndo.newTransaction('select');   // geste éditeur = balise

    let el = e.target, hit = null;
    while (el && el !== e.currentTarget) {
      // Pièce ? (_tsi posé, distinct de _tsiFace — une face pure a _tsi === _tsiFace)
      if (el._tsi && el._tsi !== el._tsiFace && el.parentElement === editedDiv) {
        hit = el._tsi;                                  // enfant direct du groupe édité
        break;
      }
      el = el.parentElement;
    }

    if (!hit) {
      // clic DANS le groupe édité (son fond) → désélection ;
      // clic HORS (contexte estompé, photo d'antan) → remontée d'UN cran.
      if (editedDiv.contains(e.target) || !TsiEditor._editStack.length)
        TsiEditorSelection.deselect();
      else
        TsiEditor.leaveGroup();
      return;
    }

    e.preventDefault();                                 // pas de sélection de texte pendant le geste
    if (!hit.editor) hit.editor = new TsiEditorPiece(hit);          // création PARESSEUSE
    TsiGroupEdited._current.editor.pieceSelected = hit.editor;      // mémoire par groupe
    hit.editor.select();
  }

  // ── Double-clic = ÉDITER LA FACE-EN-COURS ───────────────────────────
  //  Seule forme existante : la « réaction » du groupe → descente. Les autres
  //  classes de face déclareront leur forme (cadre/barre) plus tard.
  static _onDblClick(e) {
    const editedDiv = TsiGroupEdited._current?.div;
    if (!editedDiv) return;

    let el = e.target, piece = null;
    while (el && el !== e.currentTarget) {
      if (el._tsi && el._tsi !== el._tsiFace && el.parentElement === editedDiv) { piece = el._tsi; break; }
      el = el.parentElement;
    }
    if (!piece) return;

    const faceEl = piece.faceCurr;                      // Element de la face ACTIVE
    if (!faceEl?._tsiFace || !(faceEl._tsiFace instanceof TsiGroup)) return;  // pas un groupe → autre éditeur, plus tard
    e.preventDefault();
    TsiEditor.enterGroup(faceEl);
  }

  // ── Gestes clavier de l'éditeur ─────────────────────────────────────
  static _onKeyDown(e) {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyV') {   // COLLER une Pièce (test)
      e.preventDefault();
      TsiEditor.pasteFromClipboard();
    }
  }

  // ── COLLER (TEST) : Ctrl+Shift+V — la FACE portée par la pièce du presse-
  //    papier REMPLACE la face de la pièce SÉLECTIONNÉE au temps courant.
  //    C'est la machinerie d'import telle quelle : graftGroup (greffe de la
  //    face + insertKey sur la piste &face de la pièce cible).
  static async pasteFromClipboard() {
    let html;
    try { html = await navigator.clipboard.readText(); }
    catch (err) { TsiError.warning('coller : presse-papier inaccessible — ' + err.message); return; }

    const sel = TsiEditorSelection._current;
    if (!sel) { TsiError.debug('coller : aucune pièce sélectionnée — la face collée remplace la face de la SÉLECTION.'); return; }

    // la face source : BRANCHE (tsi-p > tsi-f/tsi-g, format export) OU CANON DE
    // PAGE (body > tsi-g : l'espace de la page — son id = le nom de l'appli,
    // qui devient le nom de la face greffée).
    const body = new DOMParser().parseFromString(html, 'text/html').body;
    const srcP = [...body.children].find(el => TsiPiece.tags.has(el.localName));
    const srcF = (srcP && [...srcP.children].find(el => ['tsi-f', 'tsi-g'].includes(el.localName)))
              ?? [...body.children].find(el => el.localName === 'tsi-g');
    if (!srcF) { TsiError.debug('coller : ni face (tsi-p > tsi-f/tsi-g) ni groupe racine (canon) dans le presse-papier.'); return; }

    const piece = sel.component;
    const time  = TsiGroupEdited._current?.editor?.editFrame ?? 0;

    if (typeof TsiUndo !== 'undefined') TsiUndo.newTransaction('paste');
    const root = piece.graftGroup(html, srcF.id || 'pasted', time);
    if (!root) return;                                   // refus (temps hors piste…) — déjà alerté

    TsiEditorSelection.refreshFace();                    // la face de la sélection vient de changer
    TsiError.debug(`coller : face "${root.id}" posée sur <${piece.div.id}> à t=${time}.`);
  }

  // ── DESCENTE : édition d'une face-groupe — PORTAL (opération DOM pure) ──
  //  Le div de la face-groupe est déplacé dans la couche de travail (appendChild
  //  + mémoire de l'origine). AUCUN concept Tispi convoqué : le modèle est
  //  intact, seul l'affichage d'édition bouge. Le montage d'origine s'estompe
  //  d'UN filter (le groupe n'est plus dedans).
  static enterGroup(faceEl) {
    const gFace = faceEl._tsiFace;
    if (!gFace.editor) gFace.editor = new TsiEditorGroup(gFace);

    // gel du sous-plateau à SON temps mémorisé (0 au premier édit)
    const clock = gFace.onePiece?.()?.ptClock;
    clock?.gotoStopGroup(gFace.editor.editFrame);

    TsiEditorSelection.deselect();                      // la sélection du niveau sortant reste mémorisée dans son editor

    // estompage : tout ce qui est déjà à l'écran devient contexte
    for (const c of TsiEditor._zone.children)
      if (c._tsi) c.classList.add('tsi-dimmed');        // racines du montage (le stage, sans _tsi, est sauté)
    for (const c of TsiEditor._stage.children)
      c.classList.add('tsi-dimmed');                    // niveau d'édition précédent, le cas échéant

    // PORTAL : mémoire d'origine + déplacement + centrage
    TsiEditor._editStack.push({
      faceEl,
      parent: faceEl.parentElement,
      next:   faceEl.nextSibling,
      left:   faceEl.style.left,
      top:    faceEl.style.top,
    });
    TsiEditor._stage.appendChild(faceEl);
    faceEl.style.left = Math.max(0, (TsiEditor._stage.clientWidth  - faceEl.offsetWidth)  / 2) + 'px';
    faceEl.style.top  = Math.max(0, (TsiEditor._stage.clientHeight - faceEl.offsetHeight) / 2) + 'px';

    // bascule d'état + restauration de la sélection mémorisée du groupe entré
    TsiGroupEdited.setGroup(gFace);
    if (gFace.editor.pieceSelected) TsiEditorSelection.select(gFace.editor.pieceSelected);

    if (typeof TsiUndo !== 'undefined') TsiUndo.record(() => TsiEditor.leaveGroup());
  }

  // ── REMONTÉE : miroir exact de la descente ──────────────────────────
  static leaveGroup() {
    const lvl = TsiEditor._editStack.pop();
    if (!lvl) return false;

    TsiEditorSelection.deselect();                      // la sélection du groupe quitté reste dans son editor

    // PORTAL inverse : le div retourne à sa place d'origine, position restaurée
    lvl.faceEl.style.left = lvl.left;
    lvl.faceEl.style.top  = lvl.top;
    lvl.parent.insertBefore(lvl.faceEl, lvl.next);

    // ré-éclairer le nouveau sujet
    const prev = TsiEditor._editStack[TsiEditor._editStack.length - 1];
    if (prev) prev.faceEl.classList.remove('tsi-dimmed');
    else for (const c of TsiEditor._zone.children) c.classList?.remove('tsi-dimmed');

    // bascule d'état vers le niveau parent + restauration de SA sélection
    const parentFace = prev ? prev.faceEl._tsiFace : TsiEditor._zone._tsi;
    TsiGroupEdited.setGroup(parentFace);
    if (parentFace.editor?.pieceSelected) TsiEditorSelection.select(parentFace.editor.pieceSelected);

    if (typeof TsiUndo !== 'undefined') TsiUndo.record(() => TsiEditor.enterGroup(lvl.faceEl));
    return true;
  }
}

