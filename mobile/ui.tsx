import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
export function Button({label,onPress,secondary=false,disabled=false}:{label:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}) {
  return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[s.button,secondary&&s.secondary,disabled&&s.disabled]}><Text style={[s.buttonText,secondary&&s.secondaryText]}>{label}</Text></Pressable>;
}
export function Card({children}:{children:React.ReactNode}) { return <View style={s.card}>{children}</View>; }
export const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:'#f5f7fb'},content:{padding:22,gap:17,paddingBottom:35},loading:{flex:1,alignItems:'center',justifyContent:'center',gap:15},
  header:{paddingHorizontal:22,paddingVertical:15,backgroundColor:'#fff',flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderColor:'#e4e9f1'},
  logo:{fontSize:28,fontWeight:'800',color:'#245fe4',letterSpacing:-1},profile:{fontSize:14,color:'#355478',padding:12},
  h1:{fontSize:29,lineHeight:36,fontWeight:'700',color:'#182640',letterSpacing:-.7},h2:{fontSize:21,lineHeight:29,fontWeight:'700',color:'#182640',marginBottom:8},h3:{fontSize:17,lineHeight:25,fontWeight:'600',color:'#182640',marginVertical:8},
  p:{fontSize:16,lineHeight:25,color:'#586a82',marginBottom:10},body:{fontSize:17,lineHeight:29,color:'#26394f',marginVertical:16},note:{fontSize:13,lineHeight:21,color:'#61728a',marginVertical:6},eyebrow:{fontSize:12,letterSpacing:1.1,fontWeight:'700',color:'#667b99'},
  card:{backgroundColor:'#fff',borderWidth:1,borderColor:'#e4e9f1',borderRadius:17,padding:22,flexShrink:1},
  button:{backgroundColor:'#2864ed',minHeight:48,paddingHorizontal:17,paddingVertical:13,borderRadius:10,alignItems:'center',justifyContent:'center',marginVertical:7},buttonText:{color:'white',fontSize:14,fontWeight:'600'},secondary:{backgroundColor:'#f1f5fd',borderColor:'#dce5f6',borderWidth:1},secondaryText:{color:'#244c91'},disabled:{opacity:.5},
  row:{flexDirection:'row',alignItems:'center',gap:10,flexWrap:'wrap'},big:{fontSize:34,fontWeight:'700',color:'#182640'},
  hero:{padding:24,borderRadius:18,backgroundColor:'#2864ed',gap:16},heroTag:{color:'#e0ebff',fontSize:12,letterSpacing:.7,fontWeight:'600'},heroTitle:{fontSize:29,lineHeight:36,fontWeight:'700',color:'#fff'},heroText:{fontSize:16,lineHeight:25,color:'#e4edff'},
  footer:{fontSize:12,lineHeight:20,color:'#687b92',textAlign:'center',paddingTop:20},input:{fontSize:16,borderWidth:1,borderColor:'#d6dfec',borderRadius:10,padding:14,minHeight:49,backgroundColor:'#fff',marginVertical:8,color:'#182640'},textarea:{minHeight:150,textAlignVertical:'top'},
  error:{padding:17,borderRadius:10,backgroundColor:'#fff0ed',color:'#9e3c31',fontSize:14,lineHeight:22},nav:{flexDirection:'row',backgroundColor:'#fff',borderTopWidth:1,borderColor:'#e4e9f1'},navItem:{flex:1,minHeight:58,justifyContent:'center',alignItems:'center'},navText:{fontSize:12,color:'#5f7088',fontWeight:'600'},navActive:{color:'#2864ed'},
  tabs:{marginVertical:8},tab:{paddingVertical:13,paddingHorizontal:15,borderBottomWidth:3,borderColor:'transparent'},activeTab:{borderColor:'#2864ed'},tabText:{fontSize:14,color:'#6c7b90'},activeTabText:{color:'#2864ed',fontWeight:'700'},
  flashcard:{minHeight:300,padding:28,backgroundColor:'#eaf1ff',borderWidth:1,borderColor:'#cbddff',borderRadius:18,alignItems:'center',justifyContent:'center',gap:28},option:{flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:'#dfe5ef',padding:15,borderRadius:10,minHeight:57,marginVertical:7},selected:{backgroundColor:'#edf3ff',borderColor:'#6796f1'},correct:{backgroundColor:'#eaf7ef',borderColor:'#6aba94'},optionLetter:{fontSize:14,fontWeight:'700',color:'#657a9a'},optionText:{fontSize:16,lineHeight:24,color:'#283b55',flex:1},feedback:{backgroundColor:'#f0f5ff',padding:18,borderRadius:10,marginVertical:15},
});
