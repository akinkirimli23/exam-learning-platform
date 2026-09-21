import React,{useMemo,useState,useEffect} from 'react';
import {View,Text} from 'react-native';
import {useAudioPlayer,useAudioPlayerStatus} from 'expo-audio';
import {useVideoPlayer,VideoView} from 'expo-video';
import {mediaSource} from './api';
import {Button,s} from './ui';
export function AudioMedia({id}:{id:string}) {
  const source=useMemo(()=>mediaSource(id),[id]);const player=useAudioPlayer(source);const status=useAudioPlayerStatus(player);
  const [error,setError]=useState('');
  return <View><Button label={status.playing?'Duraklat':'Sesi oynat'} onPress={()=>{try{setError('');if(status.playing)player.pause();else{if(status.didJustFinish)player.seekTo(0);player.play();}}catch{setError('Ses oynatılamadı; bağlantını kontrol et.');}}}/><Text style={s.note}>{Math.floor(status.currentTime||0)} / {Math.floor(status.duration||0)} sn</Text>{!!(error||status.error)&&<Text style={s.error}>{error||'Ses yüklenemedi. Bağlantını kontrol edip tekrar dene.'}</Text>}</View>;
}
export function VideoMedia({id}:{id:string}) {
  const source=useMemo(()=>mediaSource(id),[id]);const player=useVideoPlayer(source);const [error,setError]=useState('');
  useEffect(()=>{const subscription=player.addListener('statusChange',event=>setError(event.status==='error'?'Video oynatılamadı; bağlantını kontrol et.':''));return()=>subscription.remove();},[player]);
  return <View><VideoView player={player} style={{width:'100%',height:230,marginVertical:15}} nativeControls/>{!!error&&<Text style={s.error}>{error}</Text>}</View>;
}
