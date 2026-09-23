param()
$line = Get-Content -LiteralPath 'C:\Users\nik\OneDrive\Code\history-loom\.env.local' | Where-Object { $_ -match '^\s*ELEVENLABS_API_KEY\s*=' } | Select-Object -First 1
$key = ($line -split '=',2)[1].Trim().Trim('"').Trim("'")
$effects = @(
 @{name='atmosphere';duration=15;text='Cinematic science fiction mission control ambience, deep smooth electrical rumble, delicate distant computer pulses, immense quiet room, slowly growing uneasy. Subtle and sophisticated, no voices, no speech, no melody, no harsh hiss.'},
 @{name='riser';duration=10;text='Cinematic technological tension riser. Deep sub bass pulse gradually accelerating, fine electrical ticking layers rising in pitch and urgency, building towards a massive dark impact at the end. No speech, no voices.'},
 @{name='alarm';duration=7;text='Sophisticated spaceship mission control warning alarm. Restrained repeated low electronic warning pulses, electrical crackle and distant heavy machinery powering down, grave cinematic urgency. No speech or voices, no shrill siren.'},
 @{name='resolve';duration=6;text='Cinematic science fiction system restoring power: strong mechanical relay click, a deep warm resonant impact, then a beautiful clean shimmering electronic sustain that fades into silence. Hopeful and spacious. No voices, no speech.'}
)
foreach($effect in $effects){
 $path='trailer/audio/'+$effect.name+'.mp3'
 if(Test-Path -LiteralPath $path){continue}
 $body=@{text=$effect.text;duration_seconds=$effect.duration;prompt_influence=0.5}|ConvertTo-Json
 try{Invoke-WebRequest -Uri 'https://api.elevenlabs.io/v1/sound-generation' -Method Post -Headers @{'xi-api-key'=$key} -ContentType 'application/json' -Body $body -OutFile $path; Write-Output ($effect.name+' generated')}catch{Write-Output ($effect.name+' failed HTTP '+[int]$_.Exception.Response.StatusCode);exit 1}
}
