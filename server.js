const express = require('express');
const bodyParser = require('body-parser');
const faker = require('faker');

const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

const {PORT, DATABASE_URL} = require('./config');

const knex = require('knex')({
  client: 'pg',
  connection: {
    database: 'recipify'
  },
});



app.get('/recipes', (req, res) => {



  knex('recipes')
  .select('name', 'description')
  .returning('name', 'description')
  .then(results => {
    const myArray = Promise.all(results.map(recipe => {
        return knex.select('recipes.name', 'steps.step')
        .from('recipes')
        .where({name: recipe.name})
        .join('steps', 'steps.recipe_id', 'recipes.id')
      }));
      return myArray;
    })
    .then(rows => {
      const final_results = []
      rows.forEach((recipe, index) => {
        console.log(recipe);
        if (final_results.length <= 0) {
          final_results.push({
            name: recipe[0].name,
            steps: []
          });
          final_results[index].steps.push(recipe[0].step);
        }
        // console.log(recipe, '1');
        // console.log(final_results);
        recipe.forEach((step) => {
          let myBoolean;
          let currentIndex;
          final_results.forEach((item, index2) => {

            if (step.name === item.name) {
              final_results[index2].steps.push(step.step);
              myBoolean = true;
              return;
            } else {
              myBoolean = false;
              currentIndex = index2;
              return;
            }
          });

          if (!myBoolean) {
            console.log(step.name);
            console.log(step.step);
            final_results.push({
              name: step.name,
              steps: []
            });

            final_results[currentIndex].steps.push(step.step);
          }
          // console.log(myBoolean);
          // if (myBoolean) {
          //   console.log(step.name);
          //   console.log(step.step);
          //   final_results.push({
          //     name: step.name,
          //     steps: []
          //   });
          //   final_results[index2].steps.push(step.step);
          // }
        });
          // console.log(item);
          // console.log(recipe[0].name, '2')
          // console.log(item.name, '3')
        //   if (recipe[0].name === item.name) {
        //     final_results[index2].steps.push(recipe[0].step);
        //     return;
        //   } else {
        //     final_results.push({
        //       name: recipe[0].name,
        //       steps: []
        //     });
        //     final_results[index2].steps.push(recipe[0].step);
        //   }
        // });
      });
      console.log(final_results);
      res.json(final_results);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
  });



// app.get('/recipes', (req, res) => {
//
//   knex('recipes')
//   .select('name', 'description')
//   .returning('name', 'description')
//   .then(results => {
//     results.map(recipe => {
//       // console.log(recipe.name);
//       knex.select('recipes.name', 'steps.step')
//       .from('recipes')
//       .where({name: recipe.name})
//       .join('steps', 'steps.recipe_id', 'recipes.id')
//       .then(function(rows) {
//         const final_results = []
//         rows.forEach((recipe, index) => {
//           if (final_results.length <= 0) {
//             final_results.push({
//               name: recipe.name,
//               steps: []
//             });
//             final_results[index].steps.push(recipe.step);
//           }
//           final_results.forEach((item,index) => {
//             if (recipe.name === item.name) {
//               final_results[index].steps.push(recipe.step);
//               return;
//             } else {
//               results.push({
//                 name: recipe.name,
//                 steps: []
//               });
//               final_results[index].steps.push(recipe.step);
//             }
//           });
//         });
//
//         // res.json(final_results);
//         console.log(final_results);
//       })
//     })
//     // console.log(final_results);
//     // return(final_results);
//   })
//   .catch(err => {
//     console.error(err);
//     res.status(500).json({message: 'Internal server error'});
//   });
// });

app.post('/recipes', (req, res) => {

  knex('recipes')
  .insert({
    name: req.body.name,
    description: (req.body.description || `A recipe for ${req.body.name}`)
  })
  .returning('id')
  .then(current_id => {
    req.body.steps.map((step) => {
      console.log(current_id[0]);
      console.log(step);
      knex('steps')
      .insert({
        recipe_id: current_id[0],
        step: step
      })
      .then();
    });
  })
  .then(results => {
      res.status(201).json( {msg: 'post'} )
  });
});

//   knex('recipes')
//   .insert({
//     name: req.body.name,
//     description: (req.body.description || `A recipe for ${req.body.name}`)
//   })
//   .then((recipes) => {
//     return knex('recipes')
//     .select('id')
//     .where({
//       name: req.body.name
//     })
//     .then();
//   })
//   .then(current_id => {
//     req.body.steps.map((step) => {
//       console.log(step);
//       console.log(current_id[0].id);
//       knex('steps')
//       .insert({
//         recipe_id: current_id[0].id,
//         step: step
//       })
//       .then();
//     });
//   })
//   .then(results => {
//       res.status(201).json( {msg: 'post'} )
//   });
// });

let server;
function runServer() {
  return new Promise((resolve, reject) => {
      server = app.listen(PORT, () => {

        console.log(`Your app is listening on port ${PORT}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
}

function closeServer() {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};
