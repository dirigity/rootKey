# ROOTkey

Mi gestor de contraseñas privado. 

## Funcionamiento
Para no guardar las contraseñas lo que guardo es la información para generarla (tamaño, letras validas, letras obligatorias...). Con esta información más la contraseña maestra se genera la contraseña cada vez que la necesites y NUNCA SE GUARDA DE NINGUNA FORMA ni la contraseña ni su hash ni nada. Una ventaja respecto a otros sistemas es que cualquier contraseña maestra se tratará como válida haciendo mucho más difícil un ataque de fuerza bruta. 

En este repo se encuentra la información en texto claro sobre las cuentas mias que tengo bajo este gestor y aun asi sigue siendo seguro. 

## Uso
### Clonar el repo 
```
$git clone https://github.com/dirigity/rootKey.git
```
Es conveniente entrar en el fichero persistance.json y borrar su contenido, De otra forma estarás usando mis datos. 

/!\ NO MANIPULES EL FICHERO PERSISTANCE.JSON SIN SABER QUE ESTAS HACIENDO, PERDERAS ACCESO A TODAS TUS CONTRASEÑAS PERMANENTEMENTE /!\ 
### Crear un registro en RootKey:
```
$node register
```
Sigue las instruciones del programa. Te pedirá el nombre de la app/web, el nombre de usuario y la contraseña maestra. Habrá casos donde la contraseña sea demasiado larga o use caracteres prohibidos por la app, en ese caso responde negativamente al programa cuando te pregunte si todo ha ido bien y te dará opciones para modificar los requesitos de la contraseña.

Cuando te pida el nombre de la app será un poco insistente para facilitar introducir apps/webs ya introducidas. Para aceptar pulse intro 2 veces.
### Pedir un registro a RootKey:
```
$node getpsw
```
Sigue las instruciones del programa. Te pedirá el nombre de la app/web, el nombre de usuario y la contraseña maestra.

El nombre de la app/web no tienes porque escribirlo entero, escribe unas pocas letras iniciales y el programa hará el resto. Si no puede determinar a cual te refieres te guiará hasta que le des sufiente información.

## Motivación
No me gusta la idea de que mis contraseñas las conozca google, mozila o lastpass. Con este programa nadie las conoce (ni siquiera se guardan cifradas) y son muy seguras a nivel criptográfico.

