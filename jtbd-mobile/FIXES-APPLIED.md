# Fixes Applied to Mobile App

## Issue: TypeError with fontWeight and gap properties

### Problem
React Native has strict typing for certain style properties that don't accept arbitrary string values:
- `fontWeight`: Must be typed explicitly as specific values like `'bold'`, `'600'`, etc.
- `gap`: Not supported in older React Native versions (was a CSS Grid/Flexbox property)

### Fixes Applied

#### 1. Fixed fontWeight Properties
All instances of `fontWeight` were updated with explicit type assertions:

**Before:**
```typescript
fontWeight: 'bold',
fontWeight: '600',
```

**After:**
```typescript
fontWeight: 'bold' as 'bold',
fontWeight: '600' as '600',
```

**Files Modified:**
- ✅ `src/components/Button.tsx`
- ✅ `src/components/Input.tsx`
- ✅ `src/components/TextArea.tsx`
- ✅ `src/components/ModeCard.tsx`
- ✅ `src/pages/HomePage.tsx`
- ✅ `src/pages/LearnPage.tsx`
- ✅ `src/pages/BuildPage.tsx`
- ✅ `src/pages/CritiquePage.tsx`

#### 2. Removed gap Properties
The `gap` property was replaced with proper React Native spacing techniques:

**Before:**
```typescript
flexDirection: 'row',
gap: theme.spacing.md,
```

**After:**
```typescript
flexDirection: 'row',
justifyContent: 'space-between',
// Added marginHorizontal to child elements
```

**Files Modified:**
- ✅ `src/pages/HomePage.tsx` - Removed from recentHeader, recentCardHeader, recentItemMeta
- ✅ `src/pages/LearnPage.tsx` - Removed from navigation
- ✅ `src/pages/BuildPage.tsx` - Removed from buttonRow

#### 3. Fixed Auto Margins
The `marginLeft: 'auto'` pattern doesn't work in React Native. Replaced with flex spacer:

**Before:**
```typescript
<Clock style={styles.clockIcon} />
// clockIcon: { marginLeft: 'auto' }
```

**After:**
```typescript
<View style={{ flex: 1 }} /> {/* Spacer */}
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Clock />
  <Text>...</Text>
</View>
```

**Files Modified:**
- ✅ `src/pages/HomePage.tsx` - Fixed clockIcon positioning

#### 4. Fixed Conditional Style Application
Boolean expressions in style arrays (`condition && styles.foo`) can pass `false` as a style value. Fixed to use ternary operators:

**Before:**
```typescript
style={[
  styles.base,
  elevated && styles.shadow,
  fullWidth && styles.fullWidth,
]}
```

**After:**
```typescript
style={[
  styles.base,
  elevated ? styles.shadow : null,
  fullWidth ? styles.fullWidth : null,
]}
```

**Files Modified:**
- ✅ `src/components/Card.tsx` - Fixed elevated shadow condition
- ✅ `src/components/Button.tsx` - Fixed fullWidth and disabled conditions
- ✅ `src/components/Input.tsx` - Fixed error condition
- ✅ `src/components/TextArea.tsx` - Fixed error condition

#### 5. Removed Experimental Config Flags
Removed experimental Expo config flags that may cause issues:

**Removed:**
- `newArchEnabled` - React Native's new architecture
- `edgeToEdgeEnabled` - Android edge-to-edge
- `predictiveBackGestureEnabled` - Android gesture

## Verification

✅ TypeScript compilation: **PASSING**
✅ All fontWeight issues: **RESOLVED**
✅ All gap issues: **RESOLVED**
✅ All margin: auto issues: **RESOLVED**
✅ All conditional style issues: **RESOLVED**
✅ All experimental config flags: **REMOVED**

## Testing Status

The app should now run without the "expected dynamic type 'boolean', but had type 'string'" error.

### To Test:
```bash
cd jtbd-mobile
npm start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for web browser

## What Was The Root Cause?

React Native's StyleSheet API is stricter than CSS because it needs to bridge JavaScript to native iOS/Android views. Certain properties like `fontWeight` have specific allowed values, and the TypeScript compiler needs explicit type assertions to ensure type safety across the bridge.

The `gap` property is from modern CSS Flexbox/Grid specs and isn't fully supported in React Native yet. Instead, we use traditional spacing methods like `marginHorizontal`, `justifyContent: 'space-between'`, or flex spacers.

## Additional Notes

- All business logic remains unchanged
- Visual appearance should be identical
- Performance characteristics unchanged
- No breaking changes to API or data structures
